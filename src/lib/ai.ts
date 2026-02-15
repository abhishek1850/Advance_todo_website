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
  // Rate limit check: Max 10 calls per minute
  if (userId && !checkRateLimit(userId)) {
    throw new Error("Operational capacity reached. Please wait 60 seconds before next inquiry.");
  }

  // Sanitize inputs
  const cleanMessage = sanitizeInput(userMessage);
  if (!cleanMessage || cleanMessage.length < 2) {
    throw new Error("Inquiry too brief or empty. Please provide more tactical context.");
  }

  const safeContext = sanitizeContext(context);

  /* Advanced System Prompt */
  const systemPrompt = `Role: Elite Productivity Coach & Task Strategist for 'Attackers Arena'.
Mission: Help the user crush their goals by breaking complex tasks into small, conquering steps (micro-tasks).
Tone: Motivational, concise, punchy, and game-oriented (XP, levels). Use emoji.

Context:
- Pending Tasks: ${JSON.stringify(safeContext.pendingTasks)}
- Yesterday's Wins: ${safeContext.yesterdayCompletedCount}
- Streak: ${safeContext.streak} days

Instructions:
1. ANALYZE the user's input.
2. IF "Break It Down" or vague big task: Split it into 3-5 small, actionable micro-tasks (5-25 mins each).
   - Example: "Write Report" -> "Outline key points (10m)", "Draft Intro (15m)", "Compile Data (20m)".
3. IF "Plan Day": Suggest a "Quick Win" to start momentum, then "Deep Work" blocks.
4. MOTIVATE: Reference their streak or potential XP gain.
5. BE SPECIFIC: Action verbs first (Write, Call, Fix, Design).

Output JSON ONLY (No markdown, no text outside JSON):
{
  "reflection": "Brief, high-energy observation about their status or streak.",
  "suggestedTasks": [
    {
      "title": "Actionable Micro-Task Title",
      "priority": "critical|high|medium|low",
      "estimatedTime": 15,
      "reason": "Why start here? (e.g., 'Builds momentum', 'Clear dependencies')"
    }
  ],
  "focusAdvice": "One powerful, immediate instruction to get moving NOW."
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30s timeout

    // Always use backend API for security (secrets stay server-side)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Context: Pending=${safeContext.pendingTasks.length}, Streak=${safeContext.streak}. Message: "${cleanMessage}"` }
        ]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      // ... (error handling logic remains same)
      if (response.status === 429) {
        throw new Error("AI service is busy (Rate Limit). Please try again.");
      }
      throw new Error(`AI service error (${response.status}): ${errorText.slice(0, 100)}`);
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
