import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import {
    generateScenario,
    generateStressScenario,
    generateMission,
    generatePauseQuestions,
    analyzeDecisionSimulation,
    detectCognitiveBias,
    analyzeMissionReflection,
    analyzeStressDecision,
} from '../lib/attackModeAI';
import type {
    AttackScenario,
    CognitiveAnalysis,
    BiasDetectionResult,
    ObservationMission,
    CognitiveMetrics,
    ScenarioCategory,
} from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '../lib/production';

// ─── Firestore Session Persistence ────────────────────────────────
async function saveAttackSession(
    userId: string,
    type: string,
    scenario: AttackScenario | null,
    userResponse: string,
    selectedOptionId: string | undefined,
    aiAnalysis: CognitiveAnalysis | BiasDetectionResult | null,
    cognitiveMetrics: CognitiveMetrics | null,
    missionTitle?: string,
) {
    try {
        await addDoc(collection(db, 'attack_mode_sessions'), {
            userId,
            type,
            scenario: scenario ? {
                id: scenario.id,
                title: scenario.title,
                category: scenario.category,
                description: scenario.description?.slice(0, 500),
            } : null,
            userResponse: userResponse.slice(0, 3000),
            selectedOptionId: selectedOptionId || null,
            aiAnalysis,
            cognitiveMetrics,
            missionTitle: missionTitle || null,
            createdAt: serverTimestamp(),
            completed: true,
        });
        logger.debug('[AttackMode] Session saved to Firestore');
    } catch (e) {
        logger.error('[AttackMode] Failed to save session:', e);
        // Non-blocking — don't break the UI if save fails
    }
}

const SCENARIO_CATEGORIES: { id: ScenarioCategory; label: string }[] = [
    { id: 'workplace_conflict', label: 'Workplace Conflict' },
    { id: 'social_pressure', label: 'Social Pressure' },
    { id: 'financial_stress', label: 'Financial Stress' },
    { id: 'time_pressure', label: 'Time Pressure' },
    { id: 'ethical_dilemma', label: 'Ethical Dilemma' },
    { id: 'negotiation', label: 'Negotiation' },
    { id: 'risk_tradeoff', label: 'Risk Trade-off' },
];

type Module = 'home' | 'simulation' | 'bias' | 'pause' | 'mission' | 'stress';
type Phase = 'setup' | 'active' | 'analyzing' | 'result';

// ─── Sub-components ───────────────────────────────────────────────

function MetricBar({ label, value, inverted = false }: { label: string; value: number; inverted?: boolean }) {
    const display = inverted ? Math.max(0, 100 - value) : value;
    const color = display >= 70 ? '#4ade80' : display >= 40 ? '#facc15' : '#f87171';
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
                <span style={{ fontSize: 12, color, fontWeight: 600, fontFamily: 'monospace' }}>{display}</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${display}%`, background: color, transition: 'width 1s ease', borderRadius: 2 }} />
            </div>
        </div>
    );
}

function SectionCard({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '16px 20px', background: 'rgba(0,0,0,0.2)', marginBottom: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>{label}</div>
            {children}
        </div>
    );
}

function Tag({ text, color = '#334155' }: { text: string; color?: string }) {
    return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 4, background: color, fontSize: 11, color: '#e2e8f0', marginRight: 6, marginBottom: 6, letterSpacing: '0.03em' }}>
            {text}
        </span>
    );
}

function AnalysisBlock({ analysis }: { analysis: CognitiveAnalysis }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SectionCard label="Overall Assessment">
                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0 }}>{analysis.overallAssessment}</p>
            </SectionCard>
            <SectionCard label="Key Insight">
                <p style={{ fontSize: 14, color: '#a78bfa', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>"{analysis.keyInsight}"</p>
            </SectionCard>
            <div className="attack-analysis-grid">
                <SectionCard label="Emotional Bias">
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{analysis.emotionalBias}</p>
                </SectionCard>
                <SectionCard label="Impulse vs Strategy">
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{analysis.impulseVsStrategy}</p>
                </SectionCard>
                <SectionCard label="Risk Awareness">
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{analysis.riskAwareness}</p>
                </SectionCard>
                <SectionCard label="Time Horizon">
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{analysis.longVsShortTerm}</p>
                </SectionCard>
            </div>
            {analysis.logicalFlaws.length > 0 && (
                <SectionCard label="Logical Flaws Detected">
                    {analysis.logicalFlaws.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                            <span style={{ color: '#f87171', fontSize: 12, marginTop: 2 }}>▸</span>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{f}</p>
                        </div>
                    ))}
                </SectionCard>
            )}
            <SectionCard label="Improvement Vector">
                <p style={{ fontSize: 14, color: '#4ade80', lineHeight: 1.7, margin: 0 }}>{analysis.improvementVector}</p>
            </SectionCard>
        </div>
    );
}

function BiasBlock({ result }: { result: BiasDetectionResult }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SectionCard label="Detected Cognitive Biases">
                {result.detectedBiases.length === 0
                    ? <p style={{ color: '#4ade80', fontSize: 13, margin: 0 }}>No significant biases detected in this reflection.</p>
                    : result.detectedBiases.map((b, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                            <span style={{ color: '#f87171', fontSize: 12, marginTop: 2, flexShrink: 0 }}>⚠</span>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{b}</p>
                        </div>
                    ))}
            </SectionCard>
            {result.reasoningGaps.length > 0 && (
                <SectionCard label="Reasoning Gaps">
                    {result.reasoningGaps.map((g, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                            <span style={{ color: '#facc15', fontSize: 12, marginTop: 2 }}>▸</span>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{g}</p>
                        </div>
                    ))}
                </SectionCard>
            )}
            {result.emotionalTriggers.length > 0 && (
                <SectionCard label="Emotional Triggers">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {result.emotionalTriggers.map((t, i) => <Tag key={i} text={t} color="rgba(248,113,113,0.15)" />)}
                    </div>
                </SectionCard>
            )}
            <SectionCard label="Strategic Improvement">
                <p style={{ fontSize: 14, color: '#4ade80', lineHeight: 1.7, margin: 0 }}>{result.strategicImprovement}</p>
            </SectionCard>
        </div>
    );
}

// ─── Module: Home ─────────────────────────────────────────────────
function HomeModule({ onSelect }: { onSelect: (m: Module) => void }) {
    const modules = [
        { id: 'simulation' as Module, label: 'Decision Simulation', sub: 'AI-generated scenarios. Analyze your decision logic.', tag: 'MODULE 01' },
        { id: 'bias' as Module, label: 'Bias Detection', sub: 'Write a reflection. AI scans for cognitive distortions.', tag: 'MODULE 02' },
        { id: 'pause' as Module, label: 'Tactical Pause', sub: 'Deliberate decision protocol. Clarity before action.', tag: 'MODULE 03' },
        { id: 'mission' as Module, label: 'Observation Missions', sub: 'Real-world behavioral field assignments.', tag: 'MODULE 04' },
        { id: 'stress' as Module, label: 'Stress Decision Mode', sub: '30-second timer. Partial information. Decide.', tag: 'MODULE 05' },
    ];

    return (
        <div className="attack-module-container">
            <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.25em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>⚔ Cognitive Performance Lab</div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.03em' }}>Attack Mode</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, margin: 0, maxWidth: 500 }}>
                    A systematic protocol for sharpening decision clarity, emotional regulation, and metacognitive awareness. Select a training module to begin.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {modules.map(m => (
                    <button
                        key={m.id}
                        className="attack-module-btn"
                        onClick={() => onSelect(m.id)}
                    >
                        <div style={{ minWidth: 80, fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>{m.tag}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{m.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.sub}</div>
                        </div>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 18 }}>›</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Module 1: Decision Simulation ───────────────────────────────
function SimulationModule({ onBack }: { onBack: () => void }) {
    const { user } = useStore();
    const [phase, setPhase] = useState<Phase>('setup');
    const [category, setCategory] = useState<ScenarioCategory>('workplace_conflict');
    const [scenario, setScenario] = useState<AttackScenario | null>(null);
    const [selectedOpt, setSelectedOpt] = useState<string | undefined>(undefined);
    const [response, setResponse] = useState('');
    const [analysis, setAnalysis] = useState<CognitiveAnalysis | null>(null);
    const [metrics, setMetrics] = useState<CognitiveMetrics | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const loadScenario = async () => {
        if (!user) return;
        setLoading(true); setError('');
        try {
            const s = await generateScenario(category, user.uid);
            setScenario(s); setPhase('active');
            setSelectedOpt(undefined); setResponse('');
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    };

    const submit = async () => {
        if (!user || !scenario) return;
        if (!selectedOpt && response.trim().length < 20) { setError('Select an option or write at least 20 characters.'); return; }
        setPhase('analyzing'); setError('');
        try {
            const { analysis: a, metrics: m } = await analyzeDecisionSimulation(scenario, response, selectedOpt, user.uid);
            setAnalysis(a); setMetrics(m); setPhase('result');
            // Save to Firestore
            saveAttackSession(user.uid, 'simulation', scenario, response, selectedOpt, a, m);
        } catch (e: any) { setError(e.message); setPhase('active'); }
    };

    return (
        <div className="attack-module-container">
            <button onClick={onBack} className="attack-back-btn">← Back</button>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Module 01 — Decision Simulation Engine</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 24px', letterSpacing: '-0.02em' }}>Decision Simulation</h2>

            {phase === 'setup' && (
                <div>
                    <SectionCard label="Select Scenario Category">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {SCENARIO_CATEGORIES.map(c => (
                                <button key={c.id} onClick={() => setCategory(c.id)} style={{
                                    padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                    background: category === c.id ? 'rgba(124,108,240,0.2)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${category === c.id ? 'rgba(124,108,240,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                    color: category === c.id ? '#a78bfa' : 'var(--text-secondary)',
                                    transition: 'all 0.15s',
                                }}>{c.label}</button>
                            ))}
                        </div>
                    </SectionCard>
                    <button onClick={loadScenario} disabled={loading} className="attack-primary-btn">
                        {loading ? 'Generating scenario...' : 'Generate Scenario →'}
                    </button>
                    {error && <p className="attack-error">{error}</p>}
                </div>
            )}

            {phase === 'active' && scenario && (
                <div>
                    <SectionCard label={`Scenario — ${scenario.category.replace(/_/g, ' ').toUpperCase()}`}>
                        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px' }}>{scenario.title}</h3>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 10px' }}>{scenario.description}</p>
                        {scenario.context && <p style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic', lineHeight: 1.6, margin: 0, borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: 12 }}>{scenario.context}</p>}
                    </SectionCard>

                    <SectionCard label="Select a Course of Action">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {scenario.options.map(o => (
                                <button key={o.id} onClick={() => setSelectedOpt(o.id)} style={{
                                    padding: '12px 16px', borderRadius: 6, textAlign: 'left', cursor: 'pointer',
                                    background: selectedOpt === o.id ? 'rgba(124,108,240,0.12)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${selectedOpt === o.id ? 'rgba(124,108,240,0.4)' : 'rgba(255,255,255,0.07)'}`,
                                    transition: 'all 0.15s',
                                }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: selectedOpt === o.id ? '#a78bfa' : 'var(--text-primary)', marginBottom: 3 }}>{o.label}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o.description}</div>
                                </button>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard label="Write Your Reasoning (Optional — Improves Analysis)">
                        <textarea value={response} onChange={e => setResponse(e.target.value)}
                            placeholder="Explain your decision logic, assumptions, and anticipated trade-offs..."
                            className="attack-textarea" style={{ minHeight: 100 }} maxLength={2000} />
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right', marginTop: 4 }}>{response.length}/2000</div>
                    </SectionCard>

                    {error && <p className="attack-error">{error}</p>}
                    <button onClick={submit} className="attack-primary-btn">Submit for Analysis →</button>
                </div>
            )}

            {phase === 'analyzing' && <AnalyzingState />}

            {phase === 'result' && analysis && (
                <div>
                    {metrics && (
                        <SectionCard label="Cognitive Metrics">
                            <MetricBar label="Strategic Clarity" value={metrics.strategicClarityScore} />
                            <MetricBar label="Impulse Control" value={metrics.impulseControlScore} />
                            <MetricBar label="Decision Confidence" value={metrics.decisionConfidenceScore} />
                            <MetricBar label="Emotional Reactivity" value={metrics.emotionalReactivityScore} inverted />
                        </SectionCard>
                    )}
                    <AnalysisBlock analysis={analysis} />
                    <button onClick={() => { setPhase('setup'); setScenario(null); setAnalysis(null); }} className="attack-primary-btn" style={{ marginTop: 16 }}>Run Another Simulation →</button>
                </div>
            )}
        </div>
    );
}

// ─── Module 2: Bias Detection ─────────────────────────────────────
function BiasModule({ onBack }: { onBack: () => void }) {
    const { user } = useStore();
    const [text, setText] = useState('');
    const [result, setResult] = useState<BiasDetectionResult | null>(null);
    const [metrics, setMetrics] = useState<CognitiveMetrics | null>(null);
    const [phase, setPhase] = useState<'input' | 'analyzing' | 'result'>('input');
    const [error, setError] = useState('');

    const analyze = async () => {
        if (!user || text.trim().length < 50) { setError('Write at least 50 characters for meaningful analysis.'); return; }
        setPhase('analyzing'); setError('');
        try {
            const { result: r, metrics: m } = await detectCognitiveBias(text, user.uid);
            setResult(r); setMetrics(m); setPhase('result');
            // Save to Firestore
            saveAttackSession(user.uid, 'reflection', null, text, undefined, r, m);
        } catch (e: any) { setError(e.message); setPhase('input'); }
    };

    return (
        <div className="attack-module-container">
            <button onClick={onBack} className="attack-back-btn">← Back</button>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Module 02 — Cognitive Bias Detection</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Bias Detection Scanner</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, margin: '0 0 24px' }}>Write a reflection, plan, or journal entry. The AI will scan for confirmation bias, emotional reasoning, overconfidence, catastrophizing, and other cognitive distortions.</p>

            {phase === 'input' && (
                <>
                    <SectionCard label="Input — Reflection / Journal / Plan">
                        <textarea value={text} onChange={e => setText(e.target.value)}
                            placeholder="Write your reflection, decision rationale, or journal entry here. Be honest and detailed for accurate analysis..."
                            className="attack-textarea" style={{ minHeight: 200 }} maxLength={4000} />
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right', marginTop: 4 }}>{text.length}/4000</div>
                    </SectionCard>
                    {error && <p className="attack-error">{error}</p>}
                    <button onClick={analyze} className="attack-primary-btn">Scan for Biases →</button>
                </>
            )}
            {phase === 'analyzing' && <AnalyzingState label="Scanning for cognitive distortions..." />}
            {phase === 'result' && result && (
                <div>
                    {metrics && (
                        <SectionCard label="Cognitive Load Metrics">
                            <MetricBar label="Bias Frequency" value={Math.min(100, result.detectedBiases.length * 20)} inverted />
                            <MetricBar label="Reasoning Clarity" value={metrics.strategicClarityScore} />
                            <MetricBar label="Emotional Regulation" value={metrics.impulseControlScore} />
                        </SectionCard>
                    )}
                    <BiasBlock result={result} />
                    <button onClick={() => { setPhase('input'); setResult(null); setText(''); }} className="attack-primary-btn" style={{ marginTop: 16 }}>Scan New Entry →</button>
                </div>
            )}
        </div>
    );
}

// ─── Module 3: Tactical Pause (AI-Driven) ────────────────────────
function PauseModule({ onBack }: { onBack: () => void }) {
    const { user } = useStore();
    const [questions, setQuestions] = useState<string[]>([]);
    const [phase, setPhase] = useState<'setup' | 'loading' | 'active' | 'done'>('setup');
    const [idx, setIdx] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [error, setError] = useState('');

    const generate = async () => {
        if (!user) return;
        setPhase('loading'); setError('');
        try {
            const qs = await generatePauseQuestions(user.uid);
            setQuestions(qs);
            setAnswers(new Array(qs.length).fill(''));
            setIdx(0);
            setPhase('active');
        } catch (e: any) { setError(e.message); setPhase('setup'); }
    };

    const updateAnswer = (v: string) => { const a = [...answers]; a[idx] = v; setAnswers(a); };
    const current = answers[idx] || '';

    const next = () => {
        if (idx < questions.length - 1) setIdx(idx + 1);
        else {
            setPhase('done');
            // Save pause session to Firestore
            if (user) {
                const combined = questions.map((q, i) => `Q: ${q}\nA: ${answers[i] || '(skipped)'}`).join('\n\n');
                saveAttackSession(user.uid, 'pause', null, combined, undefined, null, null);
            }
        }
    };

    return (
        <div className="attack-module-container" style={{ maxWidth: 640 }}>
            <button onClick={onBack} className="attack-back-btn">← Back</button>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Module 03 — Tactical Pause Protocol</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Tactical Pause</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, margin: '0 0 32px' }}>AI generates 8 targeted questions to slow reactive thinking and build decision clarity. A fresh set every session.</p>

            {phase === 'setup' && (
                <div>
                    <SectionCard label="About This Protocol">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {['AI generates 8 unique questions tailored to a random decision theme.', 'Each question targets a specific cognitive blind spot.', 'Answer every question honestly before taking action.', 'Run again for a completely different question set.'].map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 20, marginTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                    {error && <p className="attack-error">{error}</p>}
                    <button onClick={generate} className="attack-primary-btn">Generate My Questions →</button>
                </div>
            )}

            {phase === 'loading' && <AnalyzingState label="AI generating your questions..." />}

            {phase === 'active' && questions.length > 0 && (
                <div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                        {questions.map((_, i) => (
                            <div key={i} style={{ flex: 1, height: 2, borderRadius: 1, background: i <= idx ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                        ))}
                    </div>
                    <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 12 }}>Question {idx + 1} of {questions.length}</div>
                    <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, margin: '0 0 24px', letterSpacing: '-0.01em' }}>"{questions[idx]}"</p>
                    <textarea value={current} onChange={e => updateAnswer(e.target.value)}
                        placeholder="Write your honest answer..."
                        className="attack-textarea" style={{ minHeight: 120 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' }}>
                        {idx > 0 ? <button onClick={() => setIdx(idx - 1)} className="attack-ghost-btn">← Previous</button> : <span />}
                        <button onClick={next} disabled={current.trim().length < 5} className="attack-primary-btn" style={{ margin: 0, opacity: current.trim().length < 5 ? 0.4 : 1 }}>
                            {idx < questions.length - 1 ? 'Next Question →' : 'Complete Protocol →'}
                        </button>
                    </div>
                </div>
            )}

            {phase === 'done' && (
                <div>
                    <SectionCard label="Protocol Complete">
                        <p style={{ color: '#4ade80', fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}>Tactical Pause complete. You have engaged all {questions.length} AI-generated decision clarity vectors.</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>Review your answers below. Generate a new set for a fully different perspective.</p>
                    </SectionCard>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                        {questions.map((q, i) => (
                            <SectionCard key={i} label={`Q${i + 1}: ${q}`}>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, fontStyle: answers[i]?.trim() ? 'normal' : 'italic' }}>
                                    {answers[i]?.trim() || '(No answer provided)'}
                                </p>
                            </SectionCard>
                        ))}
                    </div>
                    <button onClick={generate} className="attack-primary-btn" style={{ marginTop: 16 }}>Generate New Question Set →</button>
                </div>
            )}
        </div>
    );
}

// ─── Module 4: Observation Missions (AI-Driven) ───────────────────
function MissionModule({ onBack }: { onBack: () => void }) {
    const { user } = useStore();
    const [mission, setMission] = useState<ObservationMission | null>(null);
    const [reflection, setReflection] = useState('');
    const [analysis, setAnalysis] = useState<CognitiveAnalysis | null>(null);
    const [phase, setPhase] = useState<'setup' | 'generating' | 'briefing' | 'debrief' | 'analyzing' | 'result'>('setup');
    const [error, setError] = useState('');

    const diffColor = { basic: '#4ade80', intermediate: '#facc15', advanced: '#f87171' };

    const generate = async () => {
        if (!user) return;
        setPhase('generating'); setError('');
        try {
            const m = await generateMission(user.uid);
            setMission(m as ObservationMission);
            setPhase('briefing');
        } catch (e: any) { setError(e.message); setPhase('setup'); }
    };

    const submit = async () => {
        if (!user || !mission || reflection.trim().length < 50) { setError('Submit at least 50 characters.'); return; }
        setPhase('analyzing'); setError('');
        try {
            const { analysis: a } = await analyzeMissionReflection(mission.title, mission.objective, reflection, user.uid);
            setAnalysis(a); setPhase('result');
            // Save to Firestore
            saveAttackSession(user.uid, 'mission', null, reflection, undefined, a, null, mission.title);
        } catch (e: any) { setError(e.message); setPhase('debrief'); }
    };

    const handleBack = () => {
        if (phase === 'setup') onBack();
        else { setPhase('setup'); setMission(null); setAnalysis(null); setReflection(''); }
    };

    return (
        <div className="attack-module-container">
            <button onClick={handleBack} className="attack-back-btn">← Back</button>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Module 04 — Observation Missions</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Real-World Intelligence Missions</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, margin: '0 0 24px' }}>AI generates a unique field assignment every session. No two missions are the same.</p>

            {phase === 'setup' && (
                <div>
                    <SectionCard label="How It Works">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {['AI generates a unique real-world observation mission.', 'Go out and complete the mission in your actual environment.', 'Return and submit your field report.', 'AI analyzes your observation depth and pattern recognition.'].map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 20, marginTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                    {error && <p className="attack-error">{error}</p>}
                    <button onClick={generate} className="attack-primary-btn">Generate My Mission →</button>
                </div>
            )}

            {phase === 'generating' && <AnalyzingState label="AI generating your mission briefing..." />}

            {phase === 'briefing' && mission && (
                <div>
                    <SectionCard label="Mission Briefing">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{mission.title}</h3>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, background: `${(diffColor as any)[mission.difficulty]}20`, color: (diffColor as any)[mission.difficulty], textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, flexShrink: 0, marginLeft: 12 }}>{mission.difficulty}</span>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px' }}>{mission.description}</p>
                        <div style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Objective</div>
                        <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, margin: '0 0 16px', borderLeft: '2px solid var(--accent-primary)', paddingLeft: 12 }}>{mission.objective}</p>
                        <div style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Observation Vectors</div>
                        {mission.exampleInsights.map((ins, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                                <span style={{ color: 'var(--accent-primary)', fontSize: 12 }}>▸</span>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ins}</span>
                            </div>
                        ))}
                    </SectionCard>
                    <button onClick={() => setPhase('debrief')} className="attack-primary-btn">I Have Completed the Mission → Debrief</button>
                </div>
            )}

            {phase === 'debrief' && mission && (
                <div>
                    <SectionCard label="Mission Debrief — Field Report">
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 12px' }}>Document your observations, patterns identified, and analytical conclusions.</p>
                        <textarea value={reflection} onChange={e => setReflection(e.target.value)}
                            placeholder={`Report your findings from "${mission.title}".\n\nWhat did you observe? What patterns emerged? What surprised you? What did you predict — and were you right?`}
                            className="attack-textarea" style={{ minHeight: 180 }} maxLength={3000} />
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right', marginTop: 4 }}>{reflection.length}/3000</div>
                    </SectionCard>
                    {error && <p className="attack-error">{error}</p>}
                    <button onClick={submit} className="attack-primary-btn">Submit for AI Analysis →</button>
                </div>
            )}

            {phase === 'analyzing' && <AnalyzingState label="Analyzing field report..." />}

            {phase === 'result' && analysis && (
                <div>
                    <AnalysisBlock analysis={analysis} />
                    <button onClick={generate} className="attack-primary-btn" style={{ marginTop: 16 }}>Generate New Mission →</button>
                </div>
            )}
        </div>
    );
}

// ─── Module 5: Stress Decision Mode ───────────────────────────────
function StressModule({ onBack }: { onBack: () => void }) {
    const { user } = useStore();
    const [scenario, setScenario] = useState<AttackScenario | null>(null);
    const [phase, setPhase] = useState<'setup' | 'countdown' | 'active' | 'analyzing' | 'result'>('setup');
    const [timeLeft, setTimeLeft] = useState(30);
    const [countdownNum, setCountdownNum] = useState(3);
    const [selectedOpt, setSelectedOpt] = useState<string | undefined>(undefined);
    const [response, setResponse] = useState('');
    const startTimeRef = useRef<number>(0);
    const [reactionMs, setReactionMs] = useState(0);
    const [analysis, setAnalysis] = useState<CognitiveAnalysis | null>(null);
    const [metrics, setMetrics] = useState<CognitiveMetrics | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    const load = async () => {
        if (!user) return;
        setLoading(true); setError('');
        try {
            const s = await generateStressScenario(user.uid);
            setScenario(s);
            setTimeLeft(s.timeLimit || 30);
            // 3-second countdown
            setCountdownNum(3);
            setPhase('countdown');
            let c = 3;
            const cId = setInterval(() => {
                c--;
                setCountdownNum(c);
                if (c <= 0) { clearInterval(cId); activateTimer(s); }
            }, 1000);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    };

    const activateTimer = (s: AttackScenario) => {
        const limit = s.timeLimit || 30;
        setTimeLeft(limit);
        setPhase('active');
        startTimeRef.current = Date.now();
        let remaining = limit;
        timerRef.current = setInterval(() => {
            remaining--;
            setTimeLeft(remaining);
            if (remaining <= 0) { clearInterval(timerRef.current); forceSubmit(); }
        }, 1000);
    };

    const forceSubmit = useCallback(() => {
        const rt = Date.now() - startTimeRef.current;
        setReactionMs(rt);
        setPhase('analyzing');
    }, []);

    const submit = () => {
        clearInterval(timerRef.current);
        const rt = Date.now() - startTimeRef.current;
        setReactionMs(rt);
        setPhase('analyzing');
    };

    useEffect(() => {
        if (phase === 'analyzing' && scenario && user) {
            const rt = reactionMs || (scenario.timeLimit || 30) * 1000;
            analyzeStressDecision(scenario, response, selectedOpt, rt, user.uid)
                .then(({ analysis: a, metrics: m }) => {
                    setAnalysis(a); setMetrics(m); setPhase('result');
                    // Save to Firestore
                    saveAttackSession(user.uid, 'stress', scenario, response, selectedOpt, a, m);
                })
                .catch((e: any) => { setError(e.message); setPhase('active'); });
        }
    }, [phase]);

    useEffect(() => () => clearInterval(timerRef.current), []);

    const pct = scenario ? (timeLeft / (scenario.timeLimit || 30)) * 100 : 100;
    const timerColor = pct > 50 ? '#4ade80' : pct > 25 ? '#facc15' : '#f87171';

    return (
        <div className="attack-module-container">
            <button onClick={onBack} className="attack-back-btn">← Back</button>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>Module 05 — Stress Decision Mode</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Stress Decision Simulator</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, margin: '0 0 24px' }}>Limited information. Limited time. Decide.</p>

            {phase === 'setup' && (
                <div>
                    <SectionCard label="Protocol">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {['A high-pressure scenario is generated.', 'You receive partial, incomplete information.', '30-second timer starts immediately.', 'Choose an option and/or provide brief reasoning.', 'AI evaluates your stress performance.'].map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 20, marginTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                    {error && <p className="attack-error">{error}</p>}
                    <button onClick={load} disabled={loading} className="attack-primary-btn">{loading ? 'Generating...' : 'Initiate Stress Protocol →'}</button>
                </div>
            )}

            {phase === 'countdown' && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>Prepare yourself</p>
                    <div style={{ fontSize: 80, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{countdownNum}</div>
                </div>
            )}

            {phase === 'active' && scenario && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: timerColor, transition: 'width 1s linear, background 0.5s' }} />
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: timerColor, fontFamily: 'monospace', minWidth: 48, textAlign: 'right' }}>{timeLeft}s</div>
                    </div>
                    <SectionCard label="⚡ Partial Information — Decide Now">
                        <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0 }}>{scenario.partialInfo || scenario.description}</p>
                    </SectionCard>
                    <SectionCard label="Options">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {scenario.options.map(o => (
                                <button key={o.id} onClick={() => setSelectedOpt(o.id)} style={{
                                    padding: '10px 14px', borderRadius: 6, textAlign: 'left', cursor: 'pointer',
                                    background: selectedOpt === o.id ? 'rgba(124,108,240,0.15)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${selectedOpt === o.id ? 'rgba(124,108,240,0.5)' : 'rgba(255,255,255,0.07)'}`,
                                    transition: 'all 0.1s', color: selectedOpt === o.id ? '#a78bfa' : 'var(--text-primary)', fontSize: 13, fontWeight: 500,
                                }}>{o.label}</button>
                            ))}
                        </div>
                    </SectionCard>
                    <textarea value={response} onChange={e => setResponse(e.target.value)}
                        placeholder="Brief reasoning (optional)..." className="attack-textarea" style={{ minHeight: 60 }} maxLength={500} />
                    <button onClick={submit} className="attack-primary-btn attack-primary-btn--danger">Lock In Decision →</button>
                </div>
            )}

            {phase === 'analyzing' && <AnalyzingState label="Evaluating stress performance..." />}

            {phase === 'result' && analysis && scenario && (
                <div>
                    <SectionCard label="Stress Session Report">
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                            <div><div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Reaction Time</div>
                                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{(reactionMs / 1000).toFixed(1)}s</div></div>
                            {metrics && <div><div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Decision Confidence</div>
                                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{metrics.decisionConfidenceScore}</div></div>}
                        </div>
                    </SectionCard>
                    {metrics && (
                        <SectionCard label="Performance Metrics">
                            <MetricBar label="Strategic Clarity" value={metrics.strategicClarityScore} />
                            <MetricBar label="Impulse Control" value={metrics.impulseControlScore} />
                            <MetricBar label="Emotional Stability" value={metrics.emotionalReactivityScore} inverted />
                        </SectionCard>
                    )}
                    <SectionCard label="Full Scenario (Post-Decision Context)">
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{scenario.description}</p>
                    </SectionCard>
                    <AnalysisBlock analysis={analysis} />
                    <button onClick={() => { setPhase('setup'); setScenario(null); setAnalysis(null); setResponse(''); setSelectedOpt(undefined); }} className="attack-primary-btn" style={{ marginTop: 16 }}>Run Another Stress Test →</button>
                </div>
            )}
        </div>
    );
}

// ─── Shared UI helpers ────────────────────────────────────────────
function AnalyzingState({ label = 'Running cognitive analysis...' }: { label?: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 }}>
            <div className="attack-spinner" />
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13, letterSpacing: '0.08em' }}>{label}</p>
        </div>
    );
}

// ─── Root Component ───────────────────────────────────────────────
export default function AttackModeView() {
    const [activeModule, setActiveModule] = useState<Module>('home');

    const renderModule = () => {
        switch (activeModule) {
            case 'simulation': return <SimulationModule onBack={() => setActiveModule('home')} />;
            case 'bias': return <BiasModule onBack={() => setActiveModule('home')} />;
            case 'pause': return <PauseModule onBack={() => setActiveModule('home')} />;
            case 'mission': return <MissionModule onBack={() => setActiveModule('home')} />;
            case 'stress': return <StressModule onBack={() => setActiveModule('home')} />;
            default: return <HomeModule onSelect={setActiveModule} />;
        }
    };

    return (
        <div className="view-container" style={{ padding: '24px 32px', maxWidth: '100%' }}>
            {renderModule()}

            <style>{`
                .attack-module-container {
                    max-width: 720px;
                    margin: 0 auto;
                }
                .attack-back-btn {
                    background: none; border: none; color: var(--text-tertiary);
                    cursor: pointer; fontSize: 13px; margin-bottom: 24px; padding: 0;
                    display: flex; align-items: center; gap: 6px;
                    transition: color 0.15s;
                }
                .attack-back-btn:hover { color: var(--text-primary); }

                .attack-primary-btn {
                    display: block; width: 100%; padding: 13px 20px; margin-top: 12px;
                    background: rgba(124,108,240,0.1); border: 1px solid rgba(124,108,240,0.3);
                    border-radius: 8px; color: #a78bfa; cursor: pointer; font-size: 14px; font-weight: 600;
                    text-align: center; transition: all 0.2s; letter-spacing: 0.01em;
                }
                .attack-primary-btn:hover:not(:disabled) {
                    background: rgba(124,108,240,0.2); border-color: rgba(124,108,240,0.5);
                    transform: translateY(-1px); box-shadow: 0 4px 16px rgba(124,108,240,0.15);
                }
                .attack-primary-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .attack-primary-btn--danger {
                    background: rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.4); color: #f87171;
                }
                .attack-primary-btn--danger:hover:not(:disabled) {
                    background: rgba(248,113,113,0.25); border-color: rgba(248,113,113,0.6);
                }

                .attack-ghost-btn {
                    background: none; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
                    color: var(--text-secondary); cursor: pointer; font-size: 13px; padding: 10px 16px;
                    transition: all 0.2s;
                }
                .attack-ghost-btn:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); color: var(--text-primary); }

                .attack-textarea {
                    width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 6px; color: var(--text-primary); font-size: 14px; line-height: 1.7; padding: 12px;
                    resize: vertical; font-family: inherit; box-sizing: border-box; outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .attack-textarea:focus {
                    border-color: rgba(124,108,240,0.4); box-shadow: 0 0 0 2px rgba(124,108,240,0.1);
                }

                .attack-error {
                    color: #f87171; font-size: 12px; margin: 8px 0 0; padding: 8px 12px;
                    background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); border-radius: 6px;
                }

                .attack-module-btn {
                    display: flex; align-items: center; gap: 20px;
                    padding: 18px 24px; background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
                    cursor: pointer; text-align: left; transition: all 0.2s; width: 100%;
                }
                .attack-module-btn:hover {
                    background: rgba(124,108,240,0.06); border-color: rgba(124,108,240,0.25);
                    transform: translateX(3px);
                }

                .attack-analysis-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
                }

                .attack-spinner {
                    width: 40px; height: 40px;
                    border: 2px solid rgba(124,108,240,0.2); border-top-color: var(--accent-primary);
                    border-radius: 50%; animation: attack-spin 0.8s linear infinite;
                }
                @keyframes attack-spin { to { transform: rotate(360deg); } }

                @media (max-width: 640px) {
                    .attack-module-container { max-width: 100%; }
                    .attack-analysis-grid { grid-template-columns: 1fr; }
                    .attack-module-btn { padding: 14px 16px; gap: 12px; }
                    .attack-module-btn > div:first-child { min-width: 60px; }
                }
                @media (max-width: 480px) {
                    .view-container { padding: 16px !important; }
                }
            `}</style>
        </div>
    );
}
