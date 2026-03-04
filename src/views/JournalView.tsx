import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Edit3, ChevronRight, X, Calendar,
    Trophy, Lightbulb, AlertTriangle, Target, Star
} from 'lucide-react';
import { useStore } from '../store';
import { format, parseISO } from 'date-fns';

// ─────────────────────────────────────────────────────────────
// VIRTUAL LOG LIST — renders only visible rows (no library)
// ─────────────────────────────────────────────────────────────
const ITEM_HEIGHT = 74;   // px per log row (must match .vlog-item height)
const OVERSCAN = 3;    // extra rows to render above/below viewport
const CONTAINER_H = 460;  // px — must match CSS .vlog-container height

interface LogEntry {
    id: string;
    date: string;
    wins?: string;
    tomorrowIntent?: string;
}

interface VirtualLogsProps {
    entries: LogEntry[];
    viewingDate: string;
    onSelect: (date: string) => void;
}

function VirtualLogs({ entries, viewingDate, onSelect }: VirtualLogsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [atBottom, setAtBottom] = useState(false);
    const [scrollPct, setScrollPct] = useState(0);

    const onScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const st = el.scrollTop;
        const max = el.scrollHeight - el.clientHeight;
        setScrollTop(st);
        setScrollPct(max > 0 ? st / max : 1);
        setAtBottom(max <= 0 || st >= max - 2);
    }, []);

    useEffect(() => {
        // Recalculate on mount / entry count change
        const el = containerRef.current;
        if (!el) return;
        const max = el.scrollHeight - el.clientHeight;
        setAtBottom(max <= 0);
        setScrollPct(max > 0 ? el.scrollTop / max : 1);
    }, [entries.length]);

    const totalH = entries.length * ITEM_HEIGHT;
    const startIdx = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const visibleCnt = Math.ceil(CONTAINER_H / ITEM_HEIGHT) + OVERSCAN * 2;
    const endIdx = Math.min(entries.length - 1, startIdx + visibleCnt);
    const visibleRows = entries.slice(startIdx, endIdx + 1);

    return (
        <div className="vlog-shell">
            {/* Purple scroll progress bar — right edge */}
            <div className="vlog-progress-track" aria-hidden="true">
                <div
                    className="vlog-progress-fill"
                    style={{ height: `${Math.max(scrollPct * 100, entries.length > 0 ? 5 : 0)}%` }}
                />
            </div>

            {/* Scrollable viewport */}
            <div
                ref={containerRef}
                className="vlog-container"
                onScroll={onScroll}
            >
                {entries.length === 0 ? (
                    <div className="vlog-empty">
                        <span className="vlog-empty-icon">📓</span>
                        <p>No past logs yet.</p>
                        <span>Start journaling today to build your log.</span>
                    </div>
                ) : (
                    <div style={{ height: totalH, position: 'relative' }}>
                        {visibleRows.map((entry, i) => {
                            const realIdx = startIdx + i;
                            const top = realIdx * ITEM_HEIGHT;
                            const active = viewingDate === entry.date;
                            const preview = entry.wins
                                ? entry.wins.substring(0, 32)
                                : entry.tomorrowIntent
                                    ? entry.tomorrowIntent.substring(0, 32)
                                    : 'Empty log';
                            const emoji = entry.wins ? '🏆 ' : '🎯 ';

                            return (
                                <button
                                    key={entry.id}
                                    className={`vlog-item${active ? ' vlog-item--active' : ''}`}
                                    style={{ top, position: 'absolute', width: 'calc(100% - 2px)' }}
                                    onClick={() => onSelect(entry.date)}
                                    aria-pressed={active}
                                >
                                    <span className="vlog-dot" aria-hidden="true" />
                                    <span className="vlog-body">
                                        <span className="vlog-date">
                                            {format(parseISO(entry.date), 'MMM dd, yyyy')}
                                        </span>
                                        <span className="vlog-preview">
                                            {emoji}{preview}{preview.length >= 32 ? '…' : ''}
                                        </span>
                                    </span>
                                    <ChevronRight size={13} className="vlog-chevron" aria-hidden="true" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom fade — hides when at bottom */}
            {!atBottom && entries.length > 0 && (
                <div className="vlog-fade" aria-hidden="true" />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN VIEW
// ─────────────────────────────────────────────────────────────
export default function JournalView() {
    const { journalEntries, addJournalEntry, updateJournalEntry, addNotification } = useStore();
    const [viewingDate, setViewingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showSuccess, setShowSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [wins, setWins] = useState('');
    const [learn, setLearn] = useState('');
    const [mistakes, setMistakes] = useState('');
    const [tomorrowIntent, setTomorrowIntent] = useState('');

    const activeEntry = journalEntries.find(j => j.date === viewingDate);
    const isToday = viewingDate === format(new Date(), 'yyyy-MM-dd');

    React.useEffect(() => {
        if (activeEntry) {
            setWins(activeEntry.wins || '');
            setLearn(activeEntry.learn || '');
            setMistakes(activeEntry.mistakes || '');
            setTomorrowIntent(activeEntry.tomorrowIntent || '');
            setIsEditing(false);
        } else {
            setWins(''); setLearn(''); setMistakes(''); setTomorrowIntent('');
            setIsEditing(isToday);
        }
    }, [activeEntry, viewingDate, isToday]);

    const totalJournalXP = useMemo(() =>
        journalEntries.reduce((acc, e) => acc + (e.xpGain || 0) + (e.streakBonus || 0), 0),
        [journalEntries]);

    const consistencyRate = useMemo(() => {
        const thisMonth = journalEntries.filter(j => j.date.startsWith(format(new Date(), 'yyyy-MM'))).length;
        return Math.round((thisMonth / (new Date().getDate() || 1)) * 100);
    }, [journalEntries]);

    // Newest-first
    const sortedEntries = useMemo(() =>
        [...journalEntries].sort((a, b) => b.date.localeCompare(a.date)),
        [journalEntries]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = { wins, learn, mistakes, tomorrowIntent, date: viewingDate };
            if (activeEntry) {
                await updateJournalEntry(activeEntry.id, payload);
                addNotification({ title: 'Journal Updated', message: `Record for ${format(parseISO(viewingDate), 'MMM dd')} saved.`, type: 'info', icon: '💾' });
            } else {
                await addJournalEntry(payload);
                addNotification({ title: 'Mission Logged', message: 'Daily reflection secured. +25 XP earned.', type: 'xp', icon: '🎯' });
            }
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
            setIsEditing(false);
        } catch {
            addNotification({ title: 'Save Error', message: 'Failed to save your journal entry.', type: 'info', icon: '❌' });
        } finally {
            setIsSaving(false);
        }
    };

    const readonlySections = [
        { icon: <Trophy size={20} />, label: 'Wins Today', value: wins },
        { icon: <Lightbulb size={20} />, label: 'Learnings', value: learn },
        { icon: <AlertTriangle size={20} />, label: 'Mistakes & Challenges', value: mistakes },
        { icon: <Target size={20} />, label: "Tomorrow's Intent", value: tomorrowIntent },
    ];

    const editSections = [
        { icon: <Trophy size={16} />, label: 'What were your wins today?', placeholder: 'No matter how small, list your victories…', value: wins, set: setWins },
        { icon: <Lightbulb size={16} />, label: 'What did you learn?', placeholder: 'Techniques, mindset shifts, new knowledge…', value: learn, set: setLearn },
        { icon: <AlertTriangle size={16} />, label: 'Mistakes / Missed Tasks', placeholder: 'What went wrong? Why? (Be honest, no judgment)', value: mistakes, set: setMistakes },
        { icon: <Target size={16} />, label: "Tomorrow's Intent", placeholder: "What is the #1 thing that must happen tomorrow?", value: tomorrowIntent, set: setTomorrowIntent },
    ];

    return (
        <div className="page-content">
            <div className="journal-grid">

                {/* ── Left column: Entry form ── */}
                <div className="journal-main">
                    <motion.div className="glass-card journal-card"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

                        {!isEditing ? (
                            <div className="journal-readonly">
                                <div className="journal-header-actions">
                                    <div className="journal-date-badge">
                                        <Calendar size={18} />
                                        <span>{format(parseISO(viewingDate), 'MMMM dd, yyyy')}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        {!isToday && (
                                            <motion.button className="btn-secondary btn-sm"
                                                onClick={() => setViewingDate(format(new Date(), 'yyyy-MM-dd'))}
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                Back to Today
                                            </motion.button>
                                        )}
                                        <motion.button className="btn-secondary btn-sm"
                                            onClick={() => setIsEditing(true)}
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Edit3 size={14} /> Edit Entry
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="journal-sections-readonly">
                                    {readonlySections.map(({ icon, label, value }) => (
                                        <div key={label} className="journal-section-item">
                                            <div className="section-header">{icon}<span>{label}</span></div>
                                            <div className="section-content">
                                                {value || <span className="empty-val">No {label.toLowerCase()} recorded.</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="journal-form">
                                <div className="journal-sections-edit">
                                    {editSections.map(({ icon, label, placeholder, value, set }) => (
                                        <section key={label} className="form-section">
                                            <label>{icon}{label}</label>
                                            <textarea
                                                placeholder={placeholder}
                                                value={value}
                                                onChange={e => set(e.target.value)}
                                            />
                                        </section>
                                    ))}
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
                                                <><div className="btn-spinner" /><span>Securing Log…</span></>
                                            ) : showSuccess ? (
                                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="success-icon">
                                                    ✅ Entry Locked!
                                                </motion.span>
                                            ) : (
                                                <><span>{activeEntry ? 'Update Journal' : 'Lock in Entry (+25 XP)'}</span><Save size={18} className="btn-icon" /></>
                                            )}
                                        </div>
                                        <div className="btn-glow" />
                                    </motion.button>

                                    {isToday && activeEntry && !isSaving && (
                                        <motion.button className="btn-secondary"
                                            onClick={() => setIsEditing(false)}
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <X size={16} />Cancel
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* ── Right column: Sidebar ── */}
                <aside className="journal-sidebar">
                    {/* XP Badge */}
                    <motion.div className="journal-xp-badge"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
                        <Star size={20} fill="currentColor" className="xp-star" />
                        <span>Total Journal XP: {totalJournalXP}</span>
                    </motion.div>

                    {/* Analytics */}
                    <motion.div className="glass-card analytics-card"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
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
                            <div className="stat-value">
                                {journalEntries.filter(j => j.date.startsWith(format(new Date(), 'yyyy-MM'))).length}
                            </div>
                        </div>
                    </motion.div>

                    {/* Past Logs (Virtualized) */}
                    <motion.div className="glass-card history-list-card"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <div className="past-logs-header">
                            <h3>Past Logs</h3>
                            {sortedEntries.length > 0 && (
                                <span className="past-logs-count">{sortedEntries.length}</span>
                            )}
                        </div>

                        <VirtualLogs
                            entries={sortedEntries}
                            viewingDate={viewingDate}
                            onSelect={setViewingDate}
                        />
                    </motion.div>
                </aside>
            </div>

            {/* ── Styles ── */}
            <style>{`
                .journal-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 2rem;
                    max-width: 1300px;
                    width: 100%;
                }
                @media (max-width: 1200px) { .journal-grid { grid-template-columns: 1fr 300px; gap: 1.5rem; } }
                @media (max-width: 1024px) { .journal-grid { grid-template-columns: 1fr; } .journal-sidebar { order: 2; } }
                .page-content { width: 100%; max-width: 1300px; margin: 0 auto; }
                @media (max-width: 640px) { .page-content { padding: 1rem; } .journal-card { padding: 1.5rem; } .premium-save-btn { width: 100%; } }

                /* Card */
                .journal-card { padding: 2.5rem; }

                /* Form */
                .form-actions { margin-top: 2.5rem; display: flex; gap: 1rem; padding-bottom: 2rem; }
                .journal-form { display: flex; flex-direction: column; gap: 2rem; }
                .form-section { display: flex; flex-direction: column; gap: 0.75rem; }
                .form-section label {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-weight: 700; font-size: 1.1rem; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem;
                }
                .form-section textarea {
                    background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px; padding: 1rem; color: white; min-height: 120px;
                    resize: vertical; transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
                }
                .form-section textarea:focus {
                    border-color: var(--primary); outline: none;
                    background: rgba(0,0,0,0.3); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
                }

                /* Save button */
                .premium-save-btn {
                    position: relative; padding: 1rem 2rem;
                    background: var(--gradient-primary); border: none; border-radius: 16px;
                    color: white; font-weight: 800; font-size: 1rem; cursor: pointer;
                    overflow: hidden; transition: all 0.3s ease;
                    box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3), 0 0 0 1px rgba(255,255,255,0.1) inset;
                    min-width: 240px;
                }
                .premium-save-btn:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(0.5); }
                .premium-save-btn.success { background: linear-gradient(135deg,#00b09b,#96c93d); box-shadow: 0 10px 20px rgba(0,176,155,0.3); }
                .btn-content { position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
                .btn-icon { transition: transform 0.3s ease; }
                .premium-save-btn:hover:not(:disabled) .btn-icon { transform: translateX(3px) rotate(-5deg); }
                .btn-glow {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: radial-gradient(circle at center,rgba(255,255,255,0.2) 0%,transparent 70%);
                    opacity: 0; transition: opacity 0.3s ease;
                }
                .premium-save-btn:hover:not(:disabled) .btn-glow { opacity: 1; }
                .btn-spinner {
                    width: 18px; height: 18px;
                    border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
                    border-radius: 50%; animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .success-icon { font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }

                /* Readonly */
                .journal-readonly { display: flex; flex-direction: column; gap: 2.5rem; }
                .journal-sections-readonly, .journal-sections-edit { display: flex; flex-direction: column; gap: 2rem; }
                .journal-header-actions {
                    display: flex; justify-content: space-between; align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1.5rem;
                }
                .journal-date-badge {
                    display: flex; align-items: center; gap: 0.75rem;
                    padding: 0.5rem 1rem;
                    background: rgba(var(--primary-rgb),0.1); border: 1px solid rgba(var(--primary-rgb),0.2);
                    border-radius: 20px; color: var(--primary); font-weight: 500;
                }
                .journal-section-item { display: flex; flex-direction: column; gap: 0.75rem; }
                .section-header {
                    display: flex; align-items: center; gap: 0.75rem;
                    font-weight: 700; font-size: 1.1rem; color: var(--primary); margin-bottom: 0.5rem;
                }
                .section-content {
                    color: rgba(255,255,255,0.7); line-height: 1.6; padding: 1.25rem;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px; white-space: pre-wrap;
                }
                .empty-val { opacity: 0.4; font-style: italic; }

                /* XP badge */
                .journal-xp-badge {
                    display: flex; align-items: center; gap: 0.75rem;
                    padding: 1rem 1.75rem;
                    background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.3);
                    border-radius: 16px; color: gold; font-weight: 800; font-size: 1.15rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 0 20px rgba(255,215,0,0.05), 0 0 0 1px rgba(255,215,0,0.15) inset;
                }
                .xp-star { filter: drop-shadow(0 0 8px gold); }

                /* Analytics */
                .analytics-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
                .insight-stat { background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; }
                .stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 0.25rem; }
                .stat-value { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; }
                .stat-progress { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
                .stat-progress-fill { height: 100%; background: var(--primary); transition: width 0.5s ease-out; }

                /* History card */
                .history-list-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
                .past-logs-header { display: flex; align-items: center; justify-content: space-between; }
                .past-logs-header h3 { margin: 0; }
                .past-logs-count {
                    font-size: 0.75rem; font-weight: 700;
                    padding: 2px 9px;
                    background: rgba(var(--primary-rgb),0.15); border: 1px solid rgba(var(--primary-rgb),0.25);
                    border-radius: 100px; color: var(--primary);
                }

                /* ── Virtual log shell ── */
                .vlog-shell { position: relative; }

                /* Progress bar */
                .vlog-progress-track {
                    position: absolute; top: 4px; right: 0; width: 3px;
                    height: calc(100% - 8px);
                    background: rgba(255,255,255,0.05); border-radius: 99px; z-index: 10; overflow: hidden;
                }
                .vlog-progress-fill {
                    width: 100%;
                    background: linear-gradient(to bottom, var(--primary), rgba(var(--primary-rgb), 0.5));
                    border-radius: 99px;
                    transition: height 0.08s linear;
                    box-shadow: 0 0 6px var(--primary), 0 0 14px rgba(var(--primary-rgb),0.35);
                    min-height: 20px;
                }

                /* Scrollable viewport */
                .vlog-container {
                    height: 460px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    scroll-behavior: smooth;
                    padding-right: 10px;
                    scrollbar-width: none;
                }
                .vlog-container::-webkit-scrollbar { display: none; }

                /* Bottom fade — disappears when at end */
                .vlog-fade {
                    position: absolute; bottom: 0; left: 0; right: 10px; height: 76px;
                    background: linear-gradient(to bottom, transparent 0%, rgba(14,11,26,0.55) 50%, rgba(14,11,26,0.95) 100%);
                    pointer-events: none; border-radius: 0 0 12px 12px; z-index: 5;
                }

                /* Log items */
                .vlog-item {
                    display: flex; align-items: center; gap: 10px;
                    padding: 0 10px 0 4px;
                    height: 66px;
                    background: rgba(255,255,255,0.025);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    color: white; cursor: pointer; text-align: left;
                    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
                    box-sizing: border-box;
                    will-change: transform;
                }
                .vlog-item:hover {
                    background: rgba(255,255,255,0.07);
                    border-color: rgba(255,255,255,0.1);
                    transform: translateX(3px);
                }
                .vlog-item--active {
                    background: rgba(var(--primary-rgb),0.1) !important;
                    border-color: var(--primary) !important;
                }
                .vlog-item--active .vlog-dot {
                    background: var(--primary) !important;
                    box-shadow: 0 0 6px var(--primary);
                }

                .vlog-dot {
                    width: 7px; height: 7px; border-radius: 50%;
                    background: rgba(255,255,255,0.2); flex-shrink: 0; margin-left: 4px;
                    transition: background 0.15s, box-shadow 0.15s;
                }
                .vlog-body {
                    display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 3px;
                }
                .vlog-date {
                    font-size: 0.78rem; font-weight: 700;
                    color: var(--primary); letter-spacing: 0.01em;
                }
                .vlog-preview {
                    font-size: 0.72rem; color: rgba(255,255,255,0.42);
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .vlog-chevron {
                    color: rgba(255,255,255,0.18); flex-shrink: 0;
                    transition: color 0.15s, transform 0.15s;
                }
                .vlog-item:hover .vlog-chevron { color: var(--primary); transform: translateX(2px); }

                /* Empty state */
                .vlog-empty {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    height: 100%; gap: 10px; color: rgba(255,255,255,0.3); text-align: center;
                }
                .vlog-empty-icon { font-size: 2.4rem; opacity: 0.45; }
                .vlog-empty p { font-size: 0.88rem; font-weight: 600; margin: 0; color: rgba(255,255,255,0.38); }
                .vlog-empty span { font-size: 0.72rem; }

                @media (max-width: 640px) { .vlog-container { height: 340px; } }

                /* Buttons */
                .btn-secondary {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px; color: rgba(255,255,255,0.6);
                    padding: 0.75rem 1.5rem; font-weight: 600; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
                }
                .btn-secondary:hover { background: rgba(255,255,255,0.08); color: white; border-color: rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .btn-sm { padding: 0.5rem 1rem; font-size: 0.8rem; border-radius: 10px; }
            `}</style>
        </div>
    );
}
