import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Edit3, ChevronRight, X, Calendar,
    Trophy, Lightbulb, AlertTriangle, Target, Star
} from 'lucide-react';
import { useStore } from '../store';
import { format, parseISO } from 'date-fns';

export default function JournalView() {
    const { journalEntries, addJournalEntry, updateJournalEntry, addNotification } = useStore();
    const [viewingDate, setViewingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showSuccess, setShowSuccess] = useState(false);
    const activeEntry = journalEntries.find(j => j.date === viewingDate);
    const isToday = viewingDate === format(new Date(), 'yyyy-MM-dd');

    const [wins, setWins] = useState('');
    const [learn, setLearn] = useState('');
    const [mistakes, setMistakes] = useState('');
    const [tomorrowIntent, setTomorrowIntent] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync state when activeEntry or viewingDate changes
    React.useEffect(() => {
        if (activeEntry) {
            setWins(activeEntry.wins || '');
            setLearn(activeEntry.learn || '');
            setMistakes(activeEntry.mistakes || '');
            setTomorrowIntent(activeEntry.tomorrowIntent || '');
            setIsEditing(false);
        } else {
            setWins('');
            setLearn('');
            setMistakes('');
            setTomorrowIntent('');
            setIsEditing(isToday);
        }
    }, [activeEntry, viewingDate, isToday]);

    // Analytics: XP and Consistency
    const totalJournalXP = useMemo(() => {
        return journalEntries.reduce((acc, entry) => acc + (entry.xpGain || 0) + (entry.streakBonus || 0), 0);
    }, [journalEntries]);

    const consistencyRate = useMemo(() => {
        const thisMonthEntries = journalEntries.filter(j =>
            j.date.startsWith(format(new Date(), 'yyyy-MM'))
        ).length;
        const totalDaysSoFar = new Date().getDate();
        return Math.round((thisMonthEntries / (totalDaysSoFar || 1)) * 100);
    }, [journalEntries]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const entryPayload = {
                wins,
                learn,
                mistakes,
                tomorrowIntent,
                date: viewingDate
            };

            if (activeEntry) {
                await updateJournalEntry(activeEntry.id, entryPayload);
                addNotification({
                    title: 'Journal Updated',
                    message: `Historical record for ${format(parseISO(viewingDate), 'MMM dd')} saved.`,
                    type: 'info',
                    icon: '💾'
                });
            } else {
                await addJournalEntry(entryPayload);
                addNotification({
                    title: 'Mission Logged',
                    message: 'Daily reflection secured. +25 XP earned.',
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
                                    <div className="journal-date-badge">
                                        <Calendar size={18} />
                                        <span>{format(parseISO(viewingDate), 'MMMM dd, yyyy')}</span>
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

                                <div className="journal-sections-readonly">
                                    <div className="journal-section-item">
                                        <div className="section-header">
                                            <Trophy size={20} />
                                            <span>Wins Today</span>
                                        </div>
                                        <div className="section-content">
                                            {wins || <span className="empty-val">No wins recorded.</span>}
                                        </div>
                                    </div>

                                    <div className="journal-section-item">
                                        <div className="section-header">
                                            <Lightbulb size={20} />
                                            <span>Learnings</span>
                                        </div>
                                        <div className="section-content">
                                            {learn || <span className="empty-val">No learnings recorded.</span>}
                                        </div>
                                    </div>

                                    <div className="journal-section-item">
                                        <div className="section-header">
                                            <AlertTriangle size={20} />
                                            <span>Mistakes & Challenges</span>
                                        </div>
                                        <div className="section-content">
                                            {mistakes || <span className="empty-val">No mistakes recorded.</span>}
                                        </div>
                                    </div>

                                    <div className="journal-section-item">
                                        <div className="section-header">
                                            <Target size={20} />
                                            <span>Tomorrow's Intent</span>
                                        </div>
                                        <div className="section-content">
                                            {tomorrowIntent || <span className="empty-val">No intent recorded for tomorrow.</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="journal-form">
                                <div className="journal-sections-edit">
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
                                            value={learn}
                                            onChange={(e) => setLearn(e.target.value)}
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
                                            value={tomorrowIntent}
                                            onChange={(e) => setTomorrowIntent(e.target.value)}
                                        />
                                    </section>
                                </div>

                                <div className="form-actions">
                                    <motion.button
                                        className={`premium-save-btn ${showSuccess ? 'success' : ''} ${isSaving ? 'saving' : ''}`}
                                        onClick={handleSave}
                                        disabled={isSaving || (!wins.trim() && !learn.trim() && !mistakes.trim() && !tomorrowIntent.trim()) || showSuccess}
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
                                                    <span>{activeEntry ? 'Update Journal' : 'Lock in Entry (+25 XP)'}</span>
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
                        className="journal-xp-badge"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                    >
                        <Star size={20} fill="currentColor" className="xp-star" />
                        <span>Total Journal XP: {totalJournalXP}</span>
                    </motion.div>

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

                        <div className="insight-stat">
                            <div className="stat-label">Total Entries</div>
                            <div className="stat-value">{journalEntries.length}</div>
                        </div>

                        <div className="insight-stat">
                            <div className="stat-label">This Month</div>
                            <div className="stat-value">{journalEntries.filter(j => j.date.startsWith(format(new Date(), 'yyyy-MM'))).length}</div>
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
                                <div key={entry.id} className="recent-entry-wrapper">
                                    <button
                                        className={`recent-entry-item ${viewingDate === entry.date ? 'active' : ''}`}
                                        onClick={() => setViewingDate(entry.date)}
                                    >
                                        <div className="entry-dot" style={{ background: 'var(--primary)' }} />
                                        <div className="entry-info">
                                            <span className="entry-date">{format(parseISO(entry.date), 'MMM dd')}</span>
                                            <span className="entry-preview">
                                                {entry.wins ? `🏆 ${entry.wins.substring(0, 30)}...` :
                                                    entry.tomorrowIntent ? `🎯 ${entry.tomorrowIntent.substring(0, 30)}...` :
                                                        'Empty log'}
                                            </span>
                                        </div>
                                        <ChevronRight size={14} className="chevron" />
                                    </button>
                                </div>
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

                .journal-xp-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.75rem;
                    background: rgba(255, 215, 0, 0.08);
                    border: 1px solid rgba(255, 215, 0, 0.3);
                    border-radius: 16px;
                    color: gold;
                    font-weight: 800;
                    font-size: 1.15rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.05),
                                0 0 0 1px rgba(255, 215, 0, 0.15) inset;
                }

                .xp-star {
                    filter: drop-shadow(0 0 8px gold);
                }

                .journal-sections-readonly, .journal-sections-edit {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .empty-val {
                    opacity: 0.4;
                    font-style: italic;
                }

                .form-section textarea {
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    color: white;
                    min-height: 120px;
                    resize: vertical;
                    transition: border-color 0.2s;
                    font-family: inherit;
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

                .journal-date-badge {
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
                    color: var(--primary);
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

                .recent-entry-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

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

                .form-section textarea:focus {
                    border-color: var(--primary);
                    outline: none;
                    background: rgba(0,0,0,0.3);
                    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
                }

                .form-section label {
                  margin-bottom: 0.5rem;
                  font-size: 1.1rem !important;
                  font-weight: 700 !important;
                }

                .section-header {
                  font-size: 1.1rem;
                  font-weight: 700;
                  color: var(--primary);
                  margin-bottom: 0.5rem;
                }
                
                .section-content {
                  padding: 1.25rem !important;
                  background: rgba(255,255,255,0.03) !important;
                  border: 1px solid rgba(255,255,255,0.05);
                  border-radius: 16px !important;
                }

            `}</style>
        </div>
    );
}
