import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy, AlertTriangle, Lightbulb,
    Target, Save, TrendingUp,
    Smile, Meh, Frown, Star, Edit3, ChevronRight, X
} from 'lucide-react';
import { useStore } from '../store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { LineChart, Line, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const moodEmojis = [
    { value: 1, icon: Frown, label: 'Tough Day', color: '#ff4d4d' },
    { value: 2, icon: Meh, label: 'Average', color: '#ffa64d' },
    { value: 3, icon: Smile, label: 'Good', color: '#4dff88' },
    { value: 4, icon: Star, label: 'Great', color: '#4de8ff' },
    { value: 5, icon: Trophy, label: 'Victory', color: '#e04dff' },
];

export default function JournalView() {
    const { journalEntries, addJournalEntry, updateJournalEntry, addNotification } = useStore();
    const [viewingDate, setViewingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showSuccess, setShowSuccess] = useState(false);
    const activeEntry = journalEntries.find(j => j.date === viewingDate);
    const isToday = viewingDate === format(new Date(), 'yyyy-MM-dd');

    const [wins, setWins] = useState('');
    const [mistakes, setMistakes] = useState('');
    const [lessons, setLessons] = useState('');
    const [intent, setIntent] = useState('');
    const [mood, setMood] = useState(3);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync state when activeEntry or viewingDate changes
    React.useEffect(() => {
        if (activeEntry) {
            setWins(activeEntry.wins);
            setMistakes(activeEntry.mistakes);
            setLessons(activeEntry.lessons);
            setIntent(activeEntry.tomorrowIntent);
            setMood(activeEntry.mood);
            setIsEditing(false);
        } else {
            setWins('');
            setMistakes('');
            setLessons('');
            setIntent('');
            setMood(3);
            setIsEditing(isToday);
        }
    }, [activeEntry, viewingDate, isToday]);

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
            if (activeEntry) {
                await updateJournalEntry(activeEntry.id, {
                    wins, mistakes, lessons, tomorrowIntent: intent, mood
                });
                addNotification({
                    title: 'Journal Updated',
                    message: `Historical record for ${format(parseISO(viewingDate), 'MMM dd')} saved.`,
                    type: 'info',
                    icon: '💾'
                });
            } else {
                await addJournalEntry({
                    wins, mistakes, lessons, tomorrowIntent: intent, mood
                });
                // XP celebration is already handled in store for new entries
                addNotification({
                    title: 'Mission Logged',
                    message: '+20 XP earned for daily reflection.',
                    type: 'xp',
                    icon: '🎯'
                });
            }
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
            setIsEditing(false);
        } catch (error) {
            addNotification({
                title: 'Save Error',
                message: 'Failed to save your journal entry.',
                type: 'info',
                icon: '❌'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="page-content">
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
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        {!isToday && (
                                            <motion.button
                                                className="btn-secondary btn-sm"
                                                onClick={() => setViewingDate(format(new Date(), 'yyyy-MM-dd'))}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Back to Today
                                            </motion.button>
                                        )}
                                        <motion.button
                                            className="btn-secondary btn-sm"
                                            onClick={() => setIsEditing(true)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Edit3 size={14} /> Edit Entry
                                        </motion.button>
                                    </div>
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
                                    <motion.button
                                        className={`premium-save-btn ${showSuccess ? 'success' : ''} ${isSaving ? 'saving' : ''}`}
                                        onClick={handleSave}
                                        disabled={isSaving || !wins.trim() || !intent.trim() || showSuccess}
                                        whileHover={{ scale: 1.02, translateY: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="btn-content">
                                            {isSaving ? (
                                                <>
                                                    <div className="btn-spinner" />
                                                    <span>Securing Log...</span>
                                                </>
                                            ) : showSuccess ? (
                                                <>
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="success-icon"
                                                    >
                                                        ✅
                                                    </motion.div>
                                                    <span>Entry Locked!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{activeEntry ? 'Update Journal' : 'Lock in Entry (+20 XP)'}</span>
                                                    <Save size={18} className="btn-icon" />
                                                </>
                                            )}
                                        </div>
                                        <div className="btn-glow" />
                                    </motion.button>
                                    {isToday && activeEntry && !isSaving && (
                                        <motion.button
                                            className="btn-secondary"
                                            onClick={() => setIsEditing(false)}
                                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <X size={16} />
                                            Cancel
                                        </motion.button>
                                    )}
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
                            <div style={{ height: 160, width: '100%', minWidth: 0 }}>
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

                    <motion.div
                        className="glass-card history-list-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3>Past Logs</h3>
                        <div className="recent-entries-list">
                            {journalEntries.map(entry => (
                                <button
                                    key={entry.id}
                                    className={`recent-entry-item ${viewingDate === entry.date ? 'active' : ''}`}
                                    onClick={() => setViewingDate(entry.date)}
                                >
                                    <div className="entry-dot" style={{ background: moodEmojis.find(m => m.value === entry.mood)?.color || 'var(--primary)' }} />
                                    <div className="entry-info">
                                        <span className="entry-date">{format(parseISO(entry.date), 'MMM dd')}</span>
                                        <span className="entry-preview">{entry.wins?.substring(0, 30)}...</span>
                                    </div>
                                    <ChevronRight size={14} />
                                </button>
                            ))}
                            {journalEntries.length === 0 && (
                                <p className="empty-text">No past logs yet.</p>
                            )}
                        </div>
                    </motion.div>
                </aside>
            </div>

            <style>{`
                .journal-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 2rem;
                    max-width: 1300px;
                    width: 100%;
                }

                @media (max-width: 1200px) {
                    .journal-grid {
                        grid-template-columns: 1fr 300px;
                        gap: 1.5rem;
                    }
                }

                @media (max-width: 1024px) {
                    .journal-grid {
                        grid-template-columns: 1fr;
                    }
                    .journal-sidebar {
                        order: 2;
                    }
                }

                .page-content {
                    width: 100%;
                    max-width: 1300px;
                    margin: 0 auto;
                }

                @media (max-width: 640px) {
                    .page-content {
                        padding: 1rem;
                    }
                    .journal-card {
                        padding: 1.5rem;
                    }
                    .premium-save-btn {
                        width: 100%;
                    }
                }

                .journal-card {
                    padding: 2.5rem;
                }

                .form-actions {
                    margin-top: 2.5rem;
                    display: flex;
                    gap: 1rem;
                    padding-bottom: 2rem;
                }

                .premium-save-btn {
                    position: relative;
                    padding: 1rem 2rem;
                    background: var(--gradient-primary);
                    border: none;
                    border-radius: 16px;
                    color: white;
                    font-weight: 800;
                    font-size: 1rem;
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3),
                                0 0 0 1px rgba(255,255,255,0.1) inset;
                    min-width: 240px;
                }

                .premium-save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    filter: grayscale(0.5);
                }

                .premium-save-btn.success {
                    background: linear-gradient(135deg, #00b09b, #96c93d);
                    box-shadow: 0 10px 20px rgba(0, 176, 155, 0.3);
                }

                .btn-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                }

                .btn-icon {
                    transition: transform 0.3s ease;
                }

                .premium-save-btn:hover:not(:disabled) .btn-icon {
                    transform: translateX(3px) rotate(-5deg);
                }

                .btn-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .premium-save-btn:hover:not(:disabled) .btn-glow {
                    opacity: 1;
                }

                .btn-spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .success-icon {
                    font-size: 1.2rem;
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
                    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                    gap: 0.75rem;
                }

                @media (max-width: 480px) {
                    .mood-selector {
                        grid-template-columns: repeat(3, 1fr);
                    }
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

                .history-list-card {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .recent-entries-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    max-height: 400px;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                }

                .recent-entry-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                }

                .recent-entry-item:hover {
                    background: rgba(255,255,255,0.08);
                    transform: translateX(4px);
                }

                .recent-entry-item.active {
                    background: rgba(var(--primary-rgb), 0.1);
                    border-color: var(--primary);
                }

                .entry-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .entry-info {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-width: 0;
                }

                .entry-date {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--primary);
                }

                .entry-preview {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.5);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .empty-text {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.3);
                    text-align: center;
                    padding: 1rem;
                }

                .recent-entries-list::-webkit-scrollbar { width: 4px; }
                .recent-entries-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

                .btn-secondary {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    padding: 0.75rem 1.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.15);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .btn-sm {
                    padding: 0.5rem 1rem;
                    font-size: 0.8rem;
                    border-radius: 10px;
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
