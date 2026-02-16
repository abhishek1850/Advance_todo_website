// ============================================
// SERVER-SIDE RATE LIMITING
// ============================================
// In-memory rate limiting (in production, use Redis/Memcached backend)

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // Max 10 requests per minute
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean old entries every 5 minutes

function checkRateLimit(userId) {
    const now = Date.now();
    const userKey = `rate_${userId}`;

    let requests = rateLimitStore.get(userKey) || [];

    // Filter out old requests outside the window
    requests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

    if (requests.length >= RATE_LIMIT_MAX) {
        return false; // Rate limit exceeded
    }

    // Add current request
    requests.push(now);
    rateLimitStore.set(userKey, requests);

    return true;
}

// Cleanup old entries periodically to prevent memory leak
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, requests] of rateLimitStore.entries()) {
            const filtered = requests.filter(t => now - t < RATE_LIMIT_WINDOW);
            if (filtered.length === 0) {
                rateLimitStore.delete(key);
            } else {
                rateLimitStore.set(key, filtered);
            }
        }
    }, CLEANUP_INTERVAL);
}

/**
 * Main AI Proxy Handler
 * - Protects API Key
 * - Implements Rate Limiting
 * - Validates Input
 * - Handles Model Fallback (70B -> 8B)
 */
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. Extract and validate user ID from headers
        let userId = 'anonymous';
        const userIdHeader = req.headers['x-user-id'];
        if (userIdHeader && typeof userIdHeader === 'string') {
            userId = userIdHeader.slice(0, 50);
        }

        // 2. Check server-side rate limit
        if (!checkRateLimit(userId)) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Maximum 10 requests per minute. Please wait before trying again.'
            });
        }

        // 3. Get the API Key securely from Server Environment
        const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            console.error('CRITICAL: Missing GROQ_API_KEY in environment');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // 4. Validate request body
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Invalid request: messages array required' });
        }

        // Strict Validation
        const MAX_TOTAL_SIZE = 200000;
        let totalSize = 0;

        for (const msg of messages) {
            if (!msg.role || !msg.content || !['system', 'user', 'assistant'].includes(msg.role)) {
                return res.status(400).json({ error: 'Invalid message structure' });
            }
            totalSize += JSON.stringify(msg).length;
        }

        if (totalSize > MAX_TOTAL_SIZE) {
            return res.status(400).json({ error: 'Request body too large' });
        }

        // 5. Call Groq with Fallback Logic
        let groqResponse;
        const config70B = {
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.6,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        };

        const config8B = {
            model: "llama-3.1-8b-instant",
            messages,
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        };

        try {
            // Priority: 70B
            groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(config70B)
            });

            // Fallback: 8B
            if (!groqResponse.ok && [404, 403, 429].includes(groqResponse.status)) {
                console.warn(`Model 70B failed (${groqResponse.status}), trying 8B fallback`);
                groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(config8B)
                });
            }
        } catch (fetchErr) {
            console.error("Upstream request failed:", fetchErr);
            return res.status(502).json({ error: "Communication failure with AI provider" });
        }

        // 6. Handle Final Response
        if (!groqResponse.ok) {
            const errorData = await groqResponse.json().catch(() => ({}));
            return res.status(groqResponse.status).json({
                error: `Upstream error (${groqResponse.status})`,
                details: errorData.error?.message || 'Unknown provider error'
            });
        }

        const data = await groqResponse.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("AI Proxy Error:", error);
        return res.status(500).json({ error: 'Internal system fault' });
    }
}
