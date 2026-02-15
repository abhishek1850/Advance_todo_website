import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Trophy, AlertTriangle, Lightbulb,
    Target, Save, Calendar, TrendingUp,
    Smile, Meh, Frown, Star, Edit3
} from 'lucide-react';
import { useStore } from '../store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { LineChart, Line, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const moodEmojis = [
    { value: 1, icon: Frown, label: 'Tough Day', color: '#ff4d4d' },
    { value: 2, icon: Meh, label: 'Average', color: '#ffa64d' },
    { value: 3, icon: Smile, label: 'Good', color: '#4dff88' },
    { value: 4, icon: Star, label: 'Great', color: '#4de8ff' },
    { value: 5, icon: Trophy, label: 'Victory', color: '#e04dff' },
];

export default function JournalView() {
    const { journalEntries, addJournalEntry, updateJournalEntry } = useStore();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const existingEntry = journalEntries.find(j => j.date === todayStr);

    const [wins, setWins] = useState(existingEntry?.wins || '');
    const [mistakes, setMistakes] = useState(existingEntry?.mistakes || '');
    const [lessons, setLessons] = useState(existingEntry?.lessons || '');
    const [intent, setIntent] = useState(existingEntry?.tomorrowIntent || '');
    const [mood, setMood] = useState(existingEntry?.mood || 3);
    const [isEditing, setIsEditing] = useState(!existingEntry);
    const [isSaving, setIsSaving] = useState(false);

    // Analytics: Last 30 days mood and consistency
    const analyticsData = useMemo(() => {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const entry = journalEntries.find(j => j.date === dateStr);
            return {
                day: format(day, 'd'),
                mood: entry ? entry.mood : null,
                completed: !!entry
            };
        }).filter(d => d.mood !== null);
    }, [journalEntries]);

    const consistencyRate = useMemo(() => {
        const thisMonthEntries = journalEntries.filter(j =>
            j.date.startsWith(format(new Date(), 'yyyy-MM'))
        ).length;
        const totalDaysSoFar = new Date().getDate();
        return Math.round((thisMonthEntries / totalDaysSoFar) * 100);
    }, [journalEntries]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (existingEntry) {
                await updateJournalEntry(existingEntry.id, {
                    wins, mistakes, lessons, tomorrowIntent: intent, mood
                });
                setIsEditing(false);
            } else {
                await addJournalEntry({
                    wins, mistakes, lessons, tomorrowIntent: intent, mood
                });
                setIsEditing(false);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="view-container">
            <header className="view-header">
                <div className="header-main">
                    <div className="header-icon-ring">
                        <BookOpen className="header-icon" />
                    </div>
                    <div>
                        <h1>Attack Journal</h1>
                        <p className="header-subtitle">Review your performance, lock in your progress.</p>
                    </div>
                </div>
                <div className="header-meta">
                    <div className="meta-item">
                        <Calendar size={14} />
                        <span>{format(new Date(), 'EEEE, MMMM do')}</span>
                    </div>
                </div>
            </header>

            <div className="journal-grid">
                {/* Journal Entry Form */}
                <div className="journal-main">
                    <motion.div
                        className="glass-card journal-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {!isEditing ? (
                            <div className="journal-readonly">
                                <div className="journal-header-actions">
                                    <div className="journal-mood-badge">
                                        {React.createElement(moodEmojis.find(m => m.value === mood)?.icon || Smile, { size: 18 })}
                                        <span>{moodEmojis.find(m => m.value === mood)?.label}</span>
                                    </div>
                                    <button className="btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
                                        <Edit3 size={14} /> Edit Entry
                                    </button>
                                </div>

                                <JournalSection title="Wins of the Day" icon={Trophy} content={wins} color="var(--success)" />
                                <JournalSection title="Lessons Learned" icon={Lightbulb} content={lessons} color="var(--primary)" />
                                <JournalSection title="Mistakes / Missed Tasks" icon={AlertTriangle} content={mistakes} color="var(--error)" />
                                <JournalSection title="Tomorrow's Intent" icon={Target} content={intent} color="var(--info)" />
                            </div>
                        ) : (
                            <div className="journal-form">
                                <section className="form-section">
                                    <label><Trophy size={16} /> What were your wins today?</label>
                                    <textarea
                                        placeholder="No matter how small, list your victories..."
                                        value={wins}
                                        onChange={(e) => setWins(e.target.value)}
                                    />
                                </section>

                                <section className="form-section">
                                    <label><Lightbulb size={16} /> What did you learn?</label>
                                    <textarea
                                        placeholder="Techniques, mindset shifts, new knowledge..."
                                        value={lessons}
                                        onChange={(e) => setLessons(e.target.value)}
                                    />
                                </section>

                                <section className="form-section">
                                    <label><AlertTriangle size={16} /> Mistakes / Missed Tasks</label>
                                    <textarea
                                        placeholder="What went wrong? Why? (Be honest, no judgment)"
                                        value={mistakes}
                                        onChange={(e) => setMistakes(e.target.value)}
                                    />
                                </section>

                                <section className="form-section">
                                    <label><Target size={16} /> Tomorrow's Intent</label>
                                    <textarea
                                        placeholder="What is the #1 thing that must happen tomorrow?"
                                        value={intent}
                                        onChange={(e) => setIntent(e.target.value)}
                                    />
                                </section>

                                <section className="form-section">
                                    <label><Smile size={16} /> Overall Mood / Energy</label>
                                    <div className="mood-selector">
                                        {moodEmojis.map((m) => (
                                            <button
                                                key={m.value}
                                                className={`mood-btn ${mood === m.value ? 'active' : ''}`}
                                                style={{ '--mood-color': m.color } as any}
                                                onClick={() => setMood(m.value)}
                                            >
                                                <m.icon size={24} />
                                                <span>{m.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                <div className="form-actions">
                                    <button
                                        className="btn-primary"
                                        onClick={handleSave}
                                        disabled={isSaving || !wins.trim() || !intent.trim()}
                                    >
                                        {isSaving ? 'Saving...' : (existingEntry ? 'Update Journal' : 'Lock in Entry (+20 XP)')}
                                        <Save size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Journal Sidebar Analytics */}
                <aside className="journal-sidebar">
                    <motion.div
                        className="glass-card analytics-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3>Journal Insights</h3>

                        <div className="insight-stat">
                            <div className="stat-label">Consistency</div>
                            <div className="stat-value">{consistencyRate}%</div>
                            <div className="stat-progress">
                                <div className="stat-progress-fill" style={{ width: `${consistencyRate}%` }} />
                            </div>
                        </div>

                        <div className="mood-chart-container">
                            <div className="chart-label"><TrendingUp size={14} /> Mood Trend (Month)</div>
                            <div style={{ height: 160, width: '100%' }}>
                                <ResponsiveContainer>
                                    <LineChart data={analyticsData}>
                                        <Line
                                            type="monotone"
                                            dataKey="mood"
                                            stroke="var(--primary)"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: 'var(--primary)' }}
                                        />
                                        <YAxis hide domain={[1, 5]} />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'rgba(20, 20, 25, 0.95)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                fontSize: '12px'
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="journal-xp-badge">
                            <Star size={14} className="xp-icon" />
                            <span>Total Journal XP: {journalEntries.reduce((acc, curr) => acc + (curr.xpEarned || 0), 0)}</span>
                        </div>
                    </motion.div>
                </aside>
            </div>

            <style>{`
                .journal-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 2rem;
                    max-width: 1200px;
                }

                @media (max-width: 1024px) {
                    .journal-grid {
                        grid-template-columns: 1fr;
                    }
                    .journal-sidebar {
                        order: -1;
                    }
                }

                .journal-card {
                    padding: 2.5rem;
                }

                .journal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .form-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .form-section label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.9);
                    font-size: 0.95rem;
                }

                .form-section textarea {
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    color: white;
                    min-height: 100px;
                    resize: vertical;
                    transition: border-color 0.2s;
                }

                .form-section textarea:focus {
                    border-color: var(--primary);
                    outline: none;
                }

                .mood-selector {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 0.75rem;
                }

                .mood-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 0.5rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    color: rgba(255,255,255,0.5);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .mood-btn:hover {
                    background: rgba(255,255,255,0.08);
                }

                .mood-btn.active {
                    background: rgba(var(--mood-color-rgb), 0.1);
                    border-color: var(--mood-color);
                    color: var(--mood-color);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                }

                .journal-readonly {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                }

                .journal-header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 1.5rem;
                }

                .journal-mood-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 1rem;
                    background: rgba(var(--primary-rgb), 0.1);
                    border: 1px solid rgba(var(--primary-rgb), 0.2);
                    border-radius: 20px;
                    color: var(--primary);
                    font-weight: 500;
                }

                .journal-section-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .section-content {
                    color: rgba(255,255,255,0.7);
                    line-height: 1.6;
                    padding: 1rem;
                    background: rgba(255,255,255,0.02);
                    border-radius: 12px;
                    white-space: pre-wrap;
                }

                .analytics-card {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .insight-stat {
                    background: rgba(255,255,255,0.03);
                    padding: 1rem;
                    border-radius: 12px;
                }

                .stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 0.25rem; }
                .stat-value { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; }
                .stat-progress { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
                .stat-progress-fill { height: 100%; background: var(--primary); transition: width 0.5s ease-out; }

                .journal-xp-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.1));
                    border: 1px solid rgba(255,215,0,0.2);
                    border-radius: 12px;
                    color: #ffd700;
                    font-size: 0.9rem;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}

function JournalSection({ title, icon: Icon, content, color }: any) {
    return (
        <div className="journal-section-item">
            <div className="section-header" style={{ color }}>
                <Icon size={20} />
                <span>{title}</span>
            </div>
            <div className="section-content">
                {content || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>No entry recorded for this section.</span>}
            </div>
        </div>
    );
}
