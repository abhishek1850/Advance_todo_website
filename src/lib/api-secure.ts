// ============================================
// SECURE API CLIENT
// Rate limiting, retries, and error handling
// ============================================

import { retryWithBackoff, logger, getSafeErrorMessage } from './production';

interface RateLimitState {
  requestCount: number;
  resetTime: number;
}

/**
 * Client-side rate limiter
 * Prevents excessive API calls from overwhelming the server
 * Server also enforces rate limits for security
 */
class ClientRateLimiter {
  private state: Record<string, RateLimitState> = {};
  private maxRequests: number = 10; // Max requests per window
  private windowMs: number = 60000; // 60 second window

  /**
   * Check if request is allowed
   * Throws error if rate limit exceeded
   */
  checkRateLimit(key: string): void {
    const now = Date.now();
    const current = this.state[key];

    if (!current || now >= current.resetTime) {
      // New window
      this.state[key] = { requestCount: 1, resetTime: now + this.windowMs };
      return;
    }

    // Within existing window
    current.requestCount++;
    if (current.requestCount > this.maxRequests) {
      const remainingMs = current.resetTime - now;
      throw new Error(
        `Rate limit exceeded. Please wait ${Math.ceil(remainingMs / 1000)} seconds.`
      );
    }
  }

  /**
   * Get remaining requests for user
   */
  getRemaining(key: string): number {
    const current = this.state[key];
    if (!current) return this.maxRequests;
    if (Date.now() >= current.resetTime) return this.maxRequests;
    return Math.max(0, this.maxRequests - current.requestCount);
  }
}

export const rateLimiter = new ClientRateLimiter();

/**
 * Secure API request helper
 * Includes:
 * - Client-side rate limiting
 * - Retry logic with exponential backoff
 * - Timeout handling
 * - Error handling & logging
 */
export const safeApiCall = async <T>(
  url: string,
  options: RequestInit & { timeout?: number; userId?: string },
  rateLimitKey?: string
): Promise<T> => {
  try {
    // Check rate limit on client
    if (rateLimitKey) {
      rateLimiter.checkRateLimit(rateLimitKey);
    }

    const timeout = options.timeout ?? 30000;
    delete options.timeout;

    // Add retry logic
    return await retryWithBackoff(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const text = await response.text();
            logger.warn(`API Error ${response.status}:`, text.slice(0, 200));

            if (response.status === 429) {
              throw new Error('Rate limit exceeded on server. Please wait.');
            }
            if (response.status === 401 || response.status === 403) {
              throw new Error('Authentication failed. Please log in again.');
            }
            if (response.status >= 500) {
              throw new Error('Server error. Please try again later.');
            }

            throw new Error(`API error: ${response.status}`);
          }

          return await response.json() as T;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      2, // Max 2 retries for API calls
      50 // Initial 50ms delay
    );
  } catch (error) {
    logger.error('API call failed:', error);
    throw new Error(getSafeErrorMessage(error));
  }
};

/**
 * Make authenticated API request
 * Includes user ID for server-side rate limiting
 */
export const authenticatedApiCall = async <T>(
  url: string,
  userId: string | null,
  options: RequestInit & { timeout?: number } = {}
): Promise<T> => {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  return safeApiCall<T>(
    url,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(userId && { 'X-User-ID': userId }),
      },
    },
    userId // Use userId as rate limit key
  );
};
