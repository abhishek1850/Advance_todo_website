import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    runtime: 'edge', // Use Edge for faster response
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Missing token' }), { status: 401 });
        }

        // In a production environment, you should verify the Firebase ID token here.
        // Const idToken = authHeader.split('Bearer ')[1];
        // await verifyFirebaseToken(idToken); 

        const { message, userContext } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server misconfiguration: No API Key' }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        const systemPrompt = `
      You are an elite productivity battle coach inside a mission management app (Attackers Arena).
      Your role is to help users plan their day intelligently.
      
      Current User Context:
      - Pending Tasks: ${JSON.stringify(userContext.pendingTasks)}
      - Yesterday's Completed Tasks: ${userContext.yesterdayCompletedCount}
      - Current Streak: ${userContext.streak} days
      
      User Message: "${message}"
      
      Response Guidelines:
      1. Suggest realistic tasks (3-6 max).
      2. Prioritize important/critical work.
      3. Don't simply list existing tasks; suggest actionable items or new ones if needed, or help prioritize existing ones.
      4. Break large goals into smaller steps if the user asks.
      5. Tone: Encouraging, structured, professional but friendly.
      6. Output strict JSON.

      JSON Schema:
      {
        "reflection": "Brief analysis of their workload or situation.",
        "suggestedTasks": [
          {
            "title": "Task Title",
            "priority": "critical | high | medium | low",
            "estimatedTime": "number (minutes)",
            "reason": "Why this task?"
          }
        ],
        "focusAdvice": "One sentence of actionable advice."
      }
    `;

        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();

        return new Response(text, {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('AI Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 });
    }
}
