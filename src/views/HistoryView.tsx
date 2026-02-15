import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store';

export default function HistoryView() {
    const { getWeeklyHistory, instances } = useStore();
    const [page, setPage] = useState(0);
    const weeksPerPage = 3;

    const history = useMemo(() => getWeeklyHistory(), [getWeeklyHistory, instances]);

    const paginatedWeeks = history.slice(page * weeksPerPage, (page + 1) * weeksPerPage);
    const totalPages = Math.ceil(history.length / weeksPerPage);

    if (history.length === 0) {
        return (
            <div className="page-content" style={{ textAlign: 'center', paddingTop: 100 }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>📜</div>
                <h2>No History Yet</h2>
                <p style={{ color: 'var(--text-tertiary)' }}>Complete tasks to start building your productivity history.</p>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="view-header" style={{ marginBottom: 40 }}>
                <div className="view-header-content">
                    <h2 className="view-title">Productivity History</h2>
                    <p className="view-subtitle">Review your weekly performance and patterns</p>
                </div>
                <div className="view-header-actions" style={{ display: 'flex', gap: 12 }}>
                    <button
                        className="btn btn-secondary"
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        style={{ padding: '8px 12px' }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        className="btn btn-secondary"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        style={{ padding: '8px 12px' }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <AnimatePresence mode="wait">
                    {paginatedWeeks.map((week, idx) => (
                        <WeeklyCard key={week.weekStart} week={week} index={idx} />
                    ))}
                </AnimatePresence>
            </div>

            {history.length > weeksPerPage && (
                <div style={{ marginTop: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    Showing {page * weeksPerPage + 1}-{Math.min((page + 1) * weeksPerPage, history.length)} of {history.length} weeks
                </div>
            )}
        </div>
    );
}

function WeeklyCard({ week, index }: { week: any, index: number }) {
    // Find highest completion value for red highlight
    const maxVal = Math.max(...week.dailyBreakdown.map((d: any) => d.completed), 1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
            className="card"
            style={{
                padding: 24,
                background: 'rgba(12, 12, 20, 0.6)',
                border: '1px solid var(--border-medium)',
                borderRadius: 24,
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
                {/* Stats Section */}
                <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(124, 108, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart3 size={20} color="var(--accent-primary)" />
                        </div>
                        <h3 style={{ fontSize: 20, fontWeight: 800 }}>{week.weekLabel}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>TOTAL TASKS</div>
                            <div style={{ fontSize: 20, fontWeight: 800 }}>{week.totalTasks}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>COMPLETED</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-success)' }}>{week.completedTasks}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>JOURNAL</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-info)' }}>{week.journalConsistency}%</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${week.progressPercentage}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 4 }}
                            />
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800, minWidth: 50, textAlign: 'right' }}>{week.progressPercentage}%</span>
                    </div>
                </div>

                {/* Graph Section */}
                <div style={{ flex: '1 1 300px', height: 180, position: 'relative' }}>
                    <div style={{ display: 'flex', height: '100%', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, paddingBottom: 24 }}>
                        {week.dailyBreakdown.map((day: any) => {
                            const isHighest = day.completed === maxVal && day.completed > 0;
                            return (
                                <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: '100%', height: 120, background: 'rgba(255,255,255,0.02)', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${day.ratio * 100}%` }}
                                            transition={{ duration: 1, ease: 'backOut' }}
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: isHighest ? '#ff5252' : 'rgba(255,255,255,0.2)',
                                                borderRadius: 4,
                                                boxShadow: isHighest ? '0 0 15px rgba(255, 82, 82, 0.3)' : 'none'
                                            }}
                                        />
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)' }}>{day.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    {/* Legend */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, display: 'flex', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: '#ff5252' }} />
                            <span style={{ color: 'var(--text-tertiary)' }}>Highest</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
                            <span style={{ color: 'var(--text-tertiary)' }}>Average/Low</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
