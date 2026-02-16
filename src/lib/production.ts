// ============================================
// PRODUCTION UTILITIES
// Production-safe helpers for robust operations
// ============================================

/**
 * Retry operation with exponential backoff
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of attempts (default: 3)
 * @param initialDelayMs - Initial delay in milliseconds (default: 100)
 * @returns Result of successful operation
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 100
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on auth errors or validation errors
      if (error instanceof Error) {
        if (error.message.includes('auth') || error.message.includes('permission')) {
          throw error;
        }
      }

      // Wait before next retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
};

/**
 * Production-safe logger
 * In production: logs only warnings and errors
 * In development: logs everything
 */
class Logger {
  private isDev: boolean;

  constructor(isDev: boolean) {
    this.isDev = isDev;
  }

  debug(message: string, data?: any): void {
    if (this.isDev) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.isDev) {
      console.log(`[INFO] ${message}`, data);
    }
  }

  warn(message: string, error?: any): void {
    console.warn(`[WARN] ${message}`, error);
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error);
  }
}

export const logger = new Logger(import.meta.env.DEV);

/**
 * Production-safe error message
 * Hides technical details from users, logs full error internally
 */
export const getSafeErrorMessage = (error: any): string => {
  // Only log full error internally
  if (error instanceof Error) {
    logger.error('Detailed error:', error);
  }

  // Return generic message to user
  const message = error?.message?.toLowerCase() || '';

  if (message.includes('auth')) return 'Authentication failed. Please try logging in again.';
  if (message.includes('permission')) return 'You do not have permission to perform this action.';
  if (message.includes('network') || message.includes('failed to fetch')) return 'Network error. Please check your connection.';
  if (message.includes('timeout')) return 'Request timed out. Please try again.';
  if (message.includes('rate limit') || message.includes('429')) return 'Too many requests. Please wait a moment.';
  if (message.includes('not found') || message.includes('404')) return 'Resource not found.';

  return 'An error occurred. Please try again.';
};

/**
 * Validate operation can be performed (user must be logged in)
 */
export const requireAuth = (userId: string | null | undefined): void => {
  if (!userId) {
    throw new Error('Authentication required. Please log in.');
  }
};
