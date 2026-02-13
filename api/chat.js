export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. Get the API Key securely from Server Environment
        // support both naming conventions
        const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
        }

        // 2. Extract message from frontend
        const { messages, model } = req.body;

        // 3. Call Groq from the backend (Hidden from user)
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || "llama-3.1-8b-instant",
                messages: messages,
                temperature: 0.7
            })
        });

        // 4. Handle Groq errors
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API Error:", errorText);
            return res.status(response.status).json({ error: `Groq provider error: ${response.status}`, details: errorText });
        }

        const data = await response.json();

        // 5. Return success to frontend
        return res.status(200).json(data);

    } catch (error) {
        console.error("Server Function Error:", error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
