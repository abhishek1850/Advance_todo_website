// ============================================
// AI Module with Security Hardening
// ============================================

// Rate limiting: max 10 requests per minute per session
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) || [];
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimitMap.set(userId, recent);
  return true;
}

// Sanitize user input to prevent prompt injection
function sanitizeInput(input: string): string {
  // Trim and limit length
  let clean = input.trim().slice(0, 1000);
  // Remove potential control characters
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return clean;
}

// Sanitize context data to prevent data leakage
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

export const generateAIResponse = async (userMessage: string, context: any, userId?: string) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing API Key. Please set VITE_GROQ_API_KEY in .env");
  }

  // Rate limit check
  if (userId && !checkRateLimit(userId)) {
    throw new Error("You're sending messages too fast. Please wait a moment before trying again.");
  }

  // Sanitize inputs
  const cleanMessage = sanitizeInput(userMessage);
  if (!cleanMessage) {
    throw new Error("Message cannot be empty.");
  }

  const safeContext = sanitizeContext(context);

  /* Minimal System Prompt */
  const systemPrompt = `Role: Productivity Coach.
Context:
- Pending: ${JSON.stringify(safeContext.pendingTasks)}
- Yest. Done: ${safeContext.yesterdayCompletedCount}
- Streak: ${safeContext.streak}
User: "${cleanMessage}"
Task: Plan day. Prioritize pending. Suggest 3-5 tasks.
Output JSON only:
{
  "reflection": "Brief analysis",
  "suggestedTasks": [{"title": "Str", "priority": "high|medium", "estimatedTime": 30, "reason": "Str"}],
  "focusAdvice": "One sentence tip"
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30s timeout

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Context: Pending=${safeContext.pendingTasks.length}, Streak=${safeContext.streak}. Message: "${cleanMessage}"` }
        ],
        temperature: 0.7
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("AI Error:", err);
      if (response.status === 429) {
        throw new Error("AI service is busy (Rate Limit). Please try again.");
      }
      throw new Error(`AI service error (${response.status}).`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) throw new Error("Empty response from AI. Please try again.");

    try {
      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '');
      const firstOpen = cleanedText.indexOf('{');
      const lastClose = cleanedText.lastIndexOf('}');

      if (firstOpen !== -1 && lastClose !== -1) {
        cleanedText = cleanedText.substring(firstOpen, lastClose + 1);
      }

      const parsed = JSON.parse(cleanedText);

      // Validate the response structure
      return {
        reflection: String(parsed.reflection || "Here's my analysis.").slice(0, 500),
        suggestedTasks: Array.isArray(parsed.suggestedTasks)
          ? parsed.suggestedTasks.slice(0, 6).map((t: any) => ({
            title: String(t.title || 'Untitled').slice(0, 100),
            priority: ['critical', 'high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
            estimatedTime: Math.min(Math.max(Number(t.estimatedTime) || 30, 5), 480),
            reason: String(t.reason || '').slice(0, 200),
          }))
          : [],
        focusAdvice: String(parsed.focusAdvice || "Stay focused and take one step at a time.").slice(0, 300),
      };
    } catch {
      return {
        reflection: "I'm having trouble formatting my response, but here are my thoughts.",
        suggestedTasks: [],
        focusAdvice: text.substring(0, 150) + "..."
      };
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  }
};
