// ============================================
// AI Module with Security Hardening
// ============================================

import { sanitizeAIContent } from './sanitize';
import { logger, getSafeErrorMessage } from './production';

/**
 * Sanitize context data to prevent data leakage
 */
function sanitizeContext(context: any): any {
  const maxTasks = 20; // Don't send more than 20 tasks to AI
  return {
    pendingTasks: (context.pendingTasks || [])
      .slice(0, maxTasks)
      .map((t: any) => ({
        title: String(t.title || '').slice(0, 100),
        priority: String(t.priority || 'medium'),
        horizon: String(t.horizon || 'daily'),
        isRolledOver: Boolean(t.isRolledOver),
      })),
    yesterdayCompletedCount: Number(context.yesterdayCompletedCount) || 0,
    streak: Number(context.streak) || 0,
  };
}

export const generateAIResponse = async (
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  context: any,
  userId?: string
) => {
  const safeContext = sanitizeContext(context);

  if (!userId) {
    throw new Error('User authentication required for AI features');
  }

  /* Advanced System Prompt */
  const systemPrompt = `Role: ARIES (Advanced Reflective Intelligence Engine System) v3.1. 
Core Objective: Strategic Tactical Coordination & Cognitive Optimization.
Mission: Transform the user (Commander) into a high-performance output machine.

User Data Matrix:
- Platform: Vercel Tactical Edge
- Current Operational Readiness (Pending Tasks): ${JSON.stringify(safeContext.pendingTasks)}
- Tactical Continuity (Streak): ${safeContext.streak} Cycles
- Yesterday's Achievement Yield: ${safeContext.yesterdayCompletedCount} Recon Ops

Engagement Protocol:
- Tone: High-tech, strategic, slightly Cyberpunk/Military Intelligence. 
- Vocabulary: Use terms like 'Pathfinding', 'Optimization', 'Yield', 'Vector', 'Strategic Yield'.
- Intelligent Reasoning: Analyze task dependencies. If a user has "Big Project", suggest "Initial Recon" or "Foundation Vector".

Strategic Directives:
1. Break down vague objectives into actionable 'Strategic Micro-Tasks' (5-20 min each).
2. If the user is overwhelmed, prioritize 'Momentum Gain' (Quick Wins).
3. If the user is idle, suggest 'Deep Work' focuses.
4. Reference the 'Neural Sync' (User Data Matrix) to provide personalized advice.

Response Schema (STRICT JSON ONLY - Do not include any text outside JSON):
{
  "reflection": "A high-level tactical brief based on current operational state and user query.",
  "suggestedTasks": [
    {
      "title": "Clear Actionable Task Title",
      "priority": "critical|high|medium|low",
      "estimatedTime": 15,
      "reason": "Tactical justification for this specific action."
    }
  ],
  "focusAdvice": "A single, high-impact directive for immediate execution."
}

CRITICAL: Do not use HTML escape codes in your response. Output clean UTF-8 text.`;

  try {
    logger.debug('Relaying AI request to secure proxy', { historyLength: messages.length });

    // In production, we MUST use our backend proxy to protect the API key
    // In local dev, we try the proxy first, then fallback to direct if proxy 404s (for quick testing)
    const isProd = import.meta.env.PROD;
    const apiUrl = '/api/chat';

    const aiMessages = [{ role: 'system' as const, content: systemPrompt }, ...messages];

    let response: any; // Using any briefly to handle the synthetic Response fallback

    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId || 'anonymous'
        },
        body: JSON.stringify({ messages: aiMessages })
      });
    } catch (e) {
      if (isProd) throw e;
      // In dev, create a synthetic response if fetch fails
      response = {
        ok: false,
        status: 404,
        json: async () => ({ error: 'Local proxy not running' })
      };
    }

    // DEV FALLBACK: If proxy missing (404) and we are in dev, try direct Groq
    if (response.status === 404 && import.meta.env.DEV) {
      const devKey = import.meta.env.VITE_GROQ_API_KEY;
      if (devKey) {
        logger.debug('Direct dev fallback triggered (Proxy 404)');
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${devKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: aiMessages,
            response_format: { type: "json_object" }
          })
        });
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `AI Link Offline (${response.status})`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Neural core returned empty response');
    }

    try {
      const parsed = JSON.parse(text);
      return validateAIResponse(parsed);
    } catch (parseError) {
      logger.warn('Neural parsing failed, attempting recovery');
      const firstOpen = text.indexOf('{');
      const lastClose = text.lastIndexOf('}');
      if (firstOpen !== -1 && lastClose !== -1) {
        const cleaned = text.substring(firstOpen, lastClose + 1);
        return validateAIResponse(JSON.parse(cleaned));
      }
      throw parseError;
    }
  } catch (error: any) {
    logger.error('Neural Sync failed:', error);
    throw new Error(getSafeErrorMessage(error));
  }
};

/**
 * Validate and sanitize AI response structure
 * Ensures all fields are safe and within bounds
 */

function validateAIResponse(parsed: any): {
  reflection: string;
  suggestedTasks: Array<{ title: string; priority: 'critical' | 'high' | 'medium' | 'low'; estimatedTime: number; reason: string }>;
  focusAdvice: string;
} {
  const validPriorities = ['critical', 'high', 'medium', 'low'];

  return {
    reflection: sanitizeAIContent(parsed.reflection || 'Analysis complete', 1000).slice(0, 1000),
    suggestedTasks: (Array.isArray(parsed.suggestedTasks) ? parsed.suggestedTasks : [])
      .slice(0, 6) // Max 6 suggestions
      .map((task: any) => {
        const priority = validPriorities.includes(task.priority) ? task.priority : 'medium';
        const estimatedTime = Math.max(1, Math.min(480, Math.round(Number(task.estimatedTime) || 30))); // 1-480 mins

        return {
          title: sanitizeAIContent(task.title || 'Untitled Vector', 100).slice(0, 100),
          priority: priority as 'critical' | 'high' | 'medium' | 'low',
          estimatedTime,
          reason: sanitizeAIContent(task.reason || '', 300).slice(0, 300),
        };
      }),
    focusAdvice: sanitizeAIContent(parsed.focusAdvice || 'Operation ready.', 500).slice(0, 500),
  };
}
