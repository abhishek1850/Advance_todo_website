// ============================================
// ⚔️ ATTACK MODE AI MODULE
// Cognitive Performance Analysis Engine
// ============================================

import type {
    AttackScenario,
    CognitiveAnalysis,
    BiasDetectionResult,
    AttackSessionType,
    CognitiveMetrics,
} from '../types';
import { logger } from './production';

const PROXY_URL = '/api/chat';

/**
 * Core proxy call — reusable for all Attack Mode AI calls
 */
async function callAIProxy(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    userId: string
): Promise<string> {
    const isProd = import.meta.env.PROD;

    let response: any;
    try {
        response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId,
            },
            body: JSON.stringify({ messages }),
        });
    } catch (e) {
        if (isProd) throw e;
        response = { ok: false, status: 404, json: async () => ({ error: 'Local proxy not running' }) };
    }

    // DEV FALLBACK
    if (response.status === 404 && import.meta.env.DEV) {
        const devKey = import.meta.env.VITE_GROQ_API_KEY;
        if (devKey) {
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${devKey}` },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages,
                    response_format: { type: 'json_object' },
                    max_tokens: 1500,
                }),
            });
        }
    }

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `AI Engine Offline (${response.status})`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('AI returned empty response');
    return text;
}

/**
 * Parse JSON from AI response with fallback extraction
 */
function parseJSON(text: string): any {
    try {
        return JSON.parse(text);
    } catch {
        const first = text.indexOf('{');
        const last = text.lastIndexOf('}');
        if (first !== -1 && last !== -1) {
            return JSON.parse(text.substring(first, last + 1));
        }
        throw new Error('Failed to parse AI response');
    }
}

// ------------------------------------------------
// MODULE 1: Decision Simulation Analysis
// ------------------------------------------------

const SIMULATION_SYSTEM_PROMPT = `You are a cognitive performance analyst. Your role is to analyze decision-making patterns with clinical precision.

Analyze the given scenario response for:
- Emotional bias (emotional reactions influencing logic)
- Logical flaws (gaps in reasoning, faulty assumptions)
- Impulse vs strategy (reactive vs deliberate thinking)
- Risk awareness (acknowledged vs ignored risks)
- Long-term vs short-term thinking orientation

Return STRICT JSON ONLY — no additional text:
{
  "emotionalBias": "Clinical assessment of emotional influence on this decision.",
  "logicalFlaws": ["Flaw 1", "Flaw 2"],
  "impulseVsStrategy": "Assessment of whether this was reactive or deliberate.",
  "riskAwareness": "Assessment of risk factors identified or missed.",
  "longVsShortTerm": "Assessment of time horizon in thinking.",
  "overallAssessment": "Concise 2-3 sentence analytical summary.",
  "keyInsight": "The single most important cognitive observation.",
  "improvementVector": "One specific, actionable cognitive improvement."
}`;

export async function analyzeDecisionSimulation(
    scenario: AttackScenario,
    userResponse: string,
    selectedOptionId: string | undefined,
    userId: string
): Promise<{ analysis: CognitiveAnalysis; metrics: CognitiveMetrics }> {
    const selectedOption = selectedOptionId
        ? scenario.options.find(o => o.id === selectedOptionId)
        : null;

    const userContent = `
SCENARIO: ${scenario.title}
CONTEXT: ${scenario.description}
${scenario.context ? `ADDITIONAL CONTEXT: ${scenario.context}` : ''}

USER'S DECISION: ${selectedOption ? `[Selected: "${selectedOption.label}"] ${selectedOption.description}` : ''}
${userResponse ? `USER'S WRITTEN REASONING: ${userResponse.slice(0, 2000)}` : ''}

Analyze this decision pattern with clinical precision.`.trim();

    logger.debug('[AttackMode] Analyzing decision simulation...');

    const messages = [
        { role: 'system' as const, content: SIMULATION_SYSTEM_PROMPT },
        { role: 'user' as const, content: userContent },
    ];

    const text = await callAIProxy(messages, userId);
    const parsed = parseJSON(text);

    const analysis: CognitiveAnalysis = {
        emotionalBias: String(parsed.emotionalBias || 'No significant emotional bias detected.').slice(0, 500),
        logicalFlaws: Array.isArray(parsed.logicalFlaws)
            ? parsed.logicalFlaws.slice(0, 5).map((f: any) => String(f).slice(0, 300))
            : [],
        impulseVsStrategy: String(parsed.impulseVsStrategy || 'Neutral pattern observed.').slice(0, 500),
        riskAwareness: String(parsed.riskAwareness || 'Risk assessment inconclusive.').slice(0, 500),
        longVsShortTerm: String(parsed.longVsShortTerm || 'Mixed temporal orientation.').slice(0, 500),
        overallAssessment: String(parsed.overallAssessment || 'Analysis complete.').slice(0, 800),
        keyInsight: String(parsed.keyInsight || 'Continue building situational awareness.').slice(0, 400),
        improvementVector: String(parsed.improvementVector || 'Focus on deliberate decision frameworks.').slice(0, 400),
    };

    // Derive cognitive metrics from analysis content signals
    const metrics = deriveCognitiveMetrics(analysis, 'simulation');
    return { analysis, metrics };
}

// ------------------------------------------------
// MODULE 2: Cognitive Bias Detection
// ------------------------------------------------

const BIAS_SYSTEM_PROMPT = `You are a cognitive bias analyst. Analyze written reflections and identify cognitive distortions with precision.

Scan for: confirmation bias, emotional reasoning, overconfidence, catastrophizing, impulse-driven thinking, black-and-white thinking, attribution errors, availability heuristic.

Return STRICT JSON ONLY:
{
  "detectedBiases": ["Bias name: Brief explanation of where you see it"],
  "reasoningGaps": ["Gap 1: What is missing from the reasoning"],
  "strategicImprovement": "One specific improvement to cognitive quality.",
  "emotionalTriggers": ["Identified emotional trigger 1"]
}`;

export async function detectCognitiveBias(
    reflectionText: string,
    userId: string
): Promise<{ result: BiasDetectionResult; metrics: CognitiveMetrics }> {
    const messages = [
        { role: 'system' as const, content: BIAS_SYSTEM_PROMPT },
        {
            role: 'user' as const,
            content: `Analyze this reflection for cognitive biases:\n\n"${reflectionText.slice(0, 3000)}"`,
        },
    ];

    logger.debug('[AttackMode] Detecting cognitive biases...');
    const text = await callAIProxy(messages, userId);
    const parsed = parseJSON(text);

    const result: BiasDetectionResult = {
        detectedBiases: Array.isArray(parsed.detectedBiases)
            ? parsed.detectedBiases.slice(0, 6).map((b: any) => String(b).slice(0, 300))
            : [],
        reasoningGaps: Array.isArray(parsed.reasoningGaps)
            ? parsed.reasoningGaps.slice(0, 5).map((g: any) => String(g).slice(0, 300))
            : [],
        strategicImprovement: String(parsed.strategicImprovement || 'Continue practicing deliberate reflection.').slice(0, 500),
        emotionalTriggers: Array.isArray(parsed.emotionalTriggers)
            ? parsed.emotionalTriggers.slice(0, 4).map((t: any) => String(t).slice(0, 200))
            : [],
    };

    const metrics: CognitiveMetrics = {
        emotionalReactivityScore: Math.min(100, result.emotionalTriggers.length * 20 + 30),
        strategicClarityScore: Math.max(0, 100 - result.reasoningGaps.length * 15),
        biasFrequency: result.detectedBiases.length,
        impulseControlScore: Math.max(0, 80 - result.detectedBiases.length * 10),
        decisionConfidenceScore: 50,
    };

    return { result, metrics };
}

// ------------------------------------------------
// MODULE 4: Observation Mission Analysis
// ------------------------------------------------

const MISSION_SYSTEM_PROMPT = `You are a behavioral intelligence analyst. The user has submitted a field observation from a real-world behavioral analysis mission.

Evaluate the quality of observation, pattern recognition, and analytical depth.

Return STRICT JSON ONLY:
{
  "patternRecognition": "Assessment of how well patterns were identified.",
  "analyticalDepth": "Assessment of the depth of analysis.",
  "emotionalBias": "Any emotional coloring in the observation.",
  "logicalFlaws": ["Any reasoning flaws"],
  "keyInsight": "The most important insight from this observation.",
  "improvementVector": "How to sharpen observation skills.",
  "overallAssessment": "Concise summary assessment.",
  "riskAwareness": "Social/situational awareness level.",
  "impulseVsStrategy": "Reactive vs deliberate observation approach.",
  "longVsShortTerm": "Short vs long term pattern awareness."
}`;

export async function analyzeMissionReflection(
    missionTitle: string,
    missionDescription: string,
    userReflection: string,
    userId: string
): Promise<{ analysis: CognitiveAnalysis; metrics: CognitiveMetrics }> {
    const messages = [
        { role: 'system' as const, content: MISSION_SYSTEM_PROMPT },
        {
            role: 'user' as const,
            content: `MISSION: ${missionTitle}\nMISSION OBJECTIVE: ${missionDescription}\n\nUSER OBSERVATION REPORT:\n"${userReflection.slice(0, 3000)}"`,
        },
    ];

    logger.debug('[AttackMode] Analyzing mission reflection...');
    const text = await callAIProxy(messages, userId);
    const parsed = parseJSON(text);

    const analysis: CognitiveAnalysis = {
        emotionalBias: String(parsed.emotionalBias || '').slice(0, 500),
        logicalFlaws: Array.isArray(parsed.logicalFlaws) ? parsed.logicalFlaws.slice(0, 4).map((f: any) => String(f).slice(0, 300)) : [],
        impulseVsStrategy: String(parsed.impulseVsStrategy || '').slice(0, 500),
        riskAwareness: String(parsed.riskAwareness || '').slice(0, 500),
        longVsShortTerm: String(parsed.longVsShortTerm || '').slice(0, 500),
        overallAssessment: String(parsed.overallAssessment || '').slice(0, 800),
        keyInsight: String(parsed.keyInsight || '').slice(0, 400),
        improvementVector: String(parsed.improvementVector || '').slice(0, 400),
    };

    const metrics = deriveCognitiveMetrics(analysis, 'mission');
    return { analysis, metrics };
}

// ------------------------------------------------
// MODULE 5: Stress Decision Evaluation
// ------------------------------------------------

const STRESS_SYSTEM_PROMPT = `You are a high-performance decision analysis system. The user made a decision under extreme time pressure with limited information.

Analyze:
- Decision stability under pressure
- Risk logic with incomplete data
- Response speed vs accuracy tradeoff

Return STRICT JSON ONLY:
{
  "emotionalBias": "Stability assessment under pressure.",
  "logicalFlaws": ["Any reasoning flaws given time constraint"],
  "impulseVsStrategy": "Was this a reactive snap judgment or a rapid strategic call?",
  "riskAwareness": "Risk handling given partial information.",
  "longVsShortTerm": "Temporal thinking orientation under pressure.",
  "overallAssessment": "Performance assessment under stress conditions.",
  "keyInsight": "Primary observation about stress performance.",
  "improvementVector": "Specific improvement for high-pressure decisions."
}`;

export async function analyzeStressDecision(
    scenario: AttackScenario,
    userResponse: string,
    selectedOptionId: string | undefined,
    reactionTimeMs: number,
    userId: string
): Promise<{ analysis: CognitiveAnalysis; metrics: CognitiveMetrics }> {
    const selectedOption = selectedOptionId ? scenario.options.find(o => o.id === selectedOptionId) : null;
    const reactionSecs = (reactionTimeMs / 1000).toFixed(1);

    const messages = [
        { role: 'system' as const, content: STRESS_SYSTEM_PROMPT },
        {
            role: 'user' as const,
            content: `STRESS SCENARIO: ${scenario.title}
PARTIAL INFORMATION PROVIDED: ${scenario.partialInfo || scenario.description}
TIME LIMIT: ${scenario.timeLimit || 30} seconds
REACTION TIME: ${reactionSecs}s

DECISION MADE: ${selectedOption ? `"${selectedOption.label}"` : 'No option selected'}
REASONING (if any): "${userResponse.slice(0, 1000)}"

Evaluate this stress decision.`,
        },
    ];

    logger.debug('[AttackMode] Analyzing stress decision...');
    const text = await callAIProxy(messages, userId);
    const parsed = parseJSON(text);

    const analysis: CognitiveAnalysis = {
        emotionalBias: String(parsed.emotionalBias || '').slice(0, 500),
        logicalFlaws: Array.isArray(parsed.logicalFlaws) ? parsed.logicalFlaws.slice(0, 4).map((f: any) => String(f).slice(0, 300)) : [],
        impulseVsStrategy: String(parsed.impulseVsStrategy || '').slice(0, 500),
        riskAwareness: String(parsed.riskAwareness || '').slice(0, 500),
        longVsShortTerm: String(parsed.longVsShortTerm || '').slice(0, 500),
        overallAssessment: String(parsed.overallAssessment || '').slice(0, 800),
        keyInsight: String(parsed.keyInsight || '').slice(0, 400),
        improvementVector: String(parsed.improvementVector || '').slice(0, 400),
    };

    const timeLimit = (scenario.timeLimit || 30) * 1000;
    const reactionRatio = Math.min(1, reactionTimeMs / timeLimit);
    const speedScore = Math.round((1 - reactionRatio) * 60 + 40); // 40-100

    const metrics: CognitiveMetrics = {
        emotionalReactivityScore: analysis.logicalFlaws.length > 2 ? 70 : 40,
        strategicClarityScore: Math.max(20, speedScore - analysis.logicalFlaws.length * 10),
        biasFrequency: analysis.logicalFlaws.length,
        impulseControlScore: reactionTimeMs < 5000 ? 60 : 80,
        decisionConfidenceScore: speedScore,
        reactionTimeMs,
    };

    return { analysis, metrics };
}

// ------------------------------------------------
// UTILITY: Derive cognitive metrics from analysis
// ------------------------------------------------

function deriveCognitiveMetrics(analysis: CognitiveAnalysis, _type: AttackSessionType): CognitiveMetrics {
    const flawCount = analysis.logicalFlaws.length;
    const hasEmotionalBias = analysis.emotionalBias.length > 50;
    const isStrategic = analysis.impulseVsStrategy.toLowerCase().includes('strategic') ||
        analysis.impulseVsStrategy.toLowerCase().includes('deliberate');

    return {
        emotionalReactivityScore: hasEmotionalBias ? Math.min(100, 40 + flawCount * 10) : Math.max(10, 30 - flawCount * 5),
        strategicClarityScore: isStrategic ? Math.min(95, 70 + (4 - flawCount) * 8) : Math.max(20, 50 - flawCount * 10),
        biasFrequency: flawCount,
        impulseControlScore: isStrategic ? 75 : 45,
        decisionConfidenceScore: Math.min(100, Math.max(20, 65 - flawCount * 8 + (isStrategic ? 15 : 0))),
    };
}

// ------------------------------------------------
// Generate Dynamic Scenario (Module 1)
// ------------------------------------------------

const SCENARIO_GEN_PROMPT = `You are a scenario design system for a cognitive performance lab. Generate ONE realistic, morally complex decision scenario.

Return STRICT JSON ONLY:
{
  "id": "unique_id_here",
  "category": "workplace_conflict|social_pressure|financial_stress|time_pressure|ethical_dilemma|negotiation|risk_tradeoff",
  "title": "Brief scenario title",
  "description": "Clear, realistic scenario description (2-3 sentences)",
  "context": "Additional context or stakes information (1-2 sentences)",
  "options": [
    {"id": "a", "label": "Option A label", "description": "What this choice means"},
    {"id": "b", "label": "Option B label", "description": "What this choice means"},
    {"id": "c", "label": "Option C label", "description": "What this choice means"}
  ]
}`;

export async function generateScenario(
    category: string,
    userId: string
): Promise<AttackScenario> {
    const messages = [
        { role: 'system' as const, content: SCENARIO_GEN_PROMPT },
        {
            role: 'user' as const,
            content: `Generate a realistic ${category.replace('_', ' ')} scenario that requires genuine decision-making under ambiguity.`,
        },
    ];

    logger.debug('[AttackMode] Generating scenario...');
    const text = await callAIProxy(messages, userId);
    const parsed = parseJSON(text);

    return {
        id: String(parsed.id || crypto.randomUUID()),
        category: (parsed.category || category) as any,
        title: String(parsed.title || 'Decision Point').slice(0, 150),
        description: String(parsed.description || '').slice(0, 600),
        context: String(parsed.context || '').slice(0, 400),
        options: Array.isArray(parsed.options)
            ? parsed.options.slice(0, 4).map((o: any) => ({
                id: String(o.id || crypto.randomUUID()),
                label: String(o.label || '').slice(0, 100),
                description: String(o.description || '').slice(0, 300),
            }))
            : [],
    };
}

// ------------------------------------------------
// Generate Stress Scenario
// ------------------------------------------------

const STRESS_SCENARIO_PROMPT = `Generate a high-pressure, time-critical scenario with incomplete information for a stress decision simulation.

Return STRICT JSON ONLY:
{
  "id": "unique_id",
  "category": "time_pressure",
  "title": "Crisis scenario title",
  "description": "Full scenario context (shown AFTER decision)",
  "context": "Stakes and implications",
  "partialInfo": "What the user sees DURING the 30-second timer — incomplete, ambiguous",
  "timeLimit": 30,
  "options": [
    {"id": "a", "label": "Option A", "description": "Brief consequence"},
    {"id": "b", "label": "Option B", "description": "Brief consequence"},
    {"id": "c", "label": "Option C", "description": "Brief consequence"}
  ]
}`;

export async function generateStressScenario(userId: string): Promise<AttackScenario> {
    const messages = [
        { role: 'system' as const, content: STRESS_SCENARIO_PROMPT },
        { role: 'user' as const, content: 'Generate a stressful, time-critical scenario requiring rapid decision under incomplete information.' },
    ];

    logger.debug('[AttackMode] Generating stress scenario...');
    const text = await callAIProxy(messages, userId);
    const parsed = parseJSON(text);

    return {
        id: String(parsed.id || crypto.randomUUID()),
        category: 'time_pressure',
        title: String(parsed.title || 'Crisis Point').slice(0, 150),
        description: String(parsed.description || '').slice(0, 600),
        context: String(parsed.context || '').slice(0, 400),
        partialInfo: String(parsed.partialInfo || parsed.description || '').slice(0, 400),
        timeLimit: Number(parsed.timeLimit) || 30,
        options: Array.isArray(parsed.options)
            ? parsed.options.slice(0, 4).map((o: any) => ({
                id: String(o.id || crypto.randomUUID()),
                label: String(o.label || '').slice(0, 100),
                description: String(o.description || '').slice(0, 300),
            }))
            : [],
    };
}

// ------------------------------------------------
// MODULE 3: Generate Tactical Pause Questions (AI)
// ------------------------------------------------

const PAUSE_QUESTIONS_PROMPT = `You are a cognitive performance coach. Generate 8 targeted deliberate-thinking questions for a Tactical Pause protocol.

Each question should cover a distinct domain: outcome clarity, assumptions audit, stakeholder impact, risk visualization, perspective shift, information gaps, avoidance patterns, and long-term framing.

Return STRICT JSON ONLY:
{
  "questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?",
    "Question 5?",
    "Question 6?",
    "Question 7?",
    "Question 8?"
  ]
}`;

export async function generatePauseQuestions(userId: string): Promise<string[]> {
    const themes = [
        'a major life or career decision',
        'a conflict with someone important',
        'a financial or resource commitment',
        'a leadership or team challenge',
        'a personal habit or behavioral change',
        'an ethical or values-based dilemma',
    ];
    const theme = themes[Math.floor(Math.random() * themes.length)];

    const messages = [
        { role: 'system' as const, content: PAUSE_QUESTIONS_PROMPT },
        {
            role: 'user' as const,
            content: `Generate 8 sharp Tactical Pause questions for someone facing ${theme}. Make them non-generic and thought-provoking.`,
        },
    ];

    logger.debug('[AttackMode] Generating tactical pause questions...');
    const text = await callAIProxy(messages, userId);
    const parsed = parseJSON(text);

    return Array.isArray(parsed.questions)
        ? parsed.questions.slice(0, 8).map((q: any) => String(q).slice(0, 300))
        : [
            'What outcome are you actually optimizing for?',
            'What are you assuming that may not be true?',
            'Who else is affected by this decision and how?',
            'What does the worst-case scenario actually look like?',
            'What would you advise someone else in this exact situation?',
            'What critical information do you wish you had right now?',
            'What are you avoiding by not making this decision?',
            'In 5 years, will this matter — and in what direction?',
        ];
}

// ------------------------------------------------
// MODULE 4: Generate Observation Mission (AI)
// ------------------------------------------------

const MISSION_GEN_PROMPT = `You are a behavioral intelligence training director. Generate ONE unique real-world field observation mission.

The user must go into their real environment and observe real people or situations.

Return STRICT JSON ONLY:
{
  "id": "unique_id",
  "title": "Mission title (max 6 words)",
  "difficulty": "basic|intermediate|advanced",
  "description": "1-2 sentences: what to observe and where.",
  "objective": "1-2 sentences: what the user must identify or analyze.",
  "exampleInsights": [
    "Specific observation vector 1",
    "Specific observation vector 2",
    "Specific observation vector 3"
  ]
}`;

export async function generateMission(userId: string): Promise<{
    id: string;
    title: string;
    difficulty: 'basic' | 'intermediate' | 'advanced';
    description: string;
    objective: string;
    exampleInsights: string[];
}> {
    const contexts = [
        'a workplace or professional setting',
        'a social gathering or public space',
        'a family or personal relationship dynamic',
        'a competitive or high-stakes environment',
        'a service or customer interaction context',
        'a leadership or authority dynamic',
    ];
    const context = contexts[Math.floor(Math.random() * contexts.length)];

    const messages = [
        { role: 'system' as const, content: MISSION_GEN_PROMPT },
        {
            role: 'user' as const,
            content: `Generate a unique behavioral observation mission set in ${context}. Make it specific, actionable, and cognitively challenging.`,
        },
    ];

    logger.debug('[AttackMode] Generating observation mission...');
    const text = await callAIProxy(messages, userId);
    const parsed = parseJSON(text);

    return {
        id: String(parsed.id || crypto.randomUUID()),
        title: String(parsed.title || 'Field Intelligence Mission').slice(0, 80),
        difficulty: (['basic', 'intermediate', 'advanced'].includes(parsed.difficulty)
            ? parsed.difficulty
            : 'intermediate') as 'basic' | 'intermediate' | 'advanced',
        description: String(parsed.description || '').slice(0, 400),
        objective: String(parsed.objective || '').slice(0, 400),
        exampleInsights: Array.isArray(parsed.exampleInsights)
            ? parsed.exampleInsights.slice(0, 4).map((i: any) => String(i).slice(0, 200))
            : ['Observe behavioral patterns carefully', 'Note exceptions', 'Track timing and triggers'],
    };
}
