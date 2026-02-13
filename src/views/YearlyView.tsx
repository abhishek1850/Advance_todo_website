import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target } from 'lucide-react';
import { useStore } from '../store';
import TaskCard from '../components/TaskCard';
import ProgressRing from '../components/ProgressRing';

export default function YearlyView() {
    const { getYearlyTasks, openTaskModal, getCompletionRate } = useStore();
    const tasks = getYearlyTasks();
    const incomplete = tasks.filter(t => !t.isCompleted);
    const completed = tasks.filter(t => t.isCompleted);
    const rate = getCompletionRate('yearly');
    const year = new Date().getFullYear();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const quarters = [
        { label: 'Q1', fullLabel: 'Q1 (Jan-Mar)', months: [0, 1, 2] },
        { label: 'Q2', fullLabel: 'Q2 (Apr-Jun)', months: [3, 4, 5] },
        { label: 'Q3', fullLabel: 'Q3 (Jul-Sep)', months: [6, 7, 8] },
        { label: 'Q4', fullLabel: 'Q4 (Oct-Dec)', months: [9, 10, 11] },
    ];
    const currentQuarter = Math.floor(new Date().getMonth() / 3);

    return (
        <div className="page-content" style={{ paddingBottom: 80 }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'center' : 'flex-start',
                marginBottom: 32,
                gap: 20,
                textAlign: isMobile ? 'center' : 'left'
            }}>
                <div>
                    <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, marginBottom: 4 }}>
                        <Target size={isMobile ? 24 : 28} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--accent-tertiary)' }} />
                        {year} Vision
                    </h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Long-term goals and yearly aspirations</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ProgressRing progress={rate} size={isMobile ? 60 : 80} strokeWidth={isMobile ? 5 : 6} color="#fd79a8" />
                    </div>
                    <button className="btn btn-primary" onClick={() => openTaskModal()}>
                        <Plus size={16} style={{ marginRight: 4 }} /> Add Vision
                    </button>
                </div>
            </div>

            {/* Quarter Timeline */}
            <motion.div className="card" style={{ marginBottom: 24, padding: isMobile ? 16 : 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="card-title">Quarterly Progress</div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: 12,
                    marginTop: 16
                }}>
                    {quarters.map((q, i) => (
                        <div key={q.label} style={{ position: 'relative' }}>
                            <div style={{
                                padding: isMobile ? '10px 8px' : '12px 16px',
                                borderRadius: 'var(--radius-md)',
                                background: i === currentQuarter ? 'rgba(253, 121, 168, 0.1)' : 'var(--bg-tertiary)',
                                border: i === currentQuarter ? '1px solid rgba(253, 121, 168, 0.3)' : '1px solid var(--border-subtle)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: isMobile ? 11 : 12,
                                    fontWeight: 600,
                                    color: i === currentQuarter ? 'var(--accent-tertiary)' : 'var(--text-secondary)',
                                    marginBottom: 4,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>{isMobile ? q.label : q.fullLabel}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                                    {i < currentQuarter ? '✅ Past' : i === currentQuarter ? '🔥 Current' : '📋 Upcoming'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {incomplete.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <div className="task-list-header">
                        <h3 className="task-list-title">Active Goals</h3>
                        <span className="task-list-count">{incomplete.length} goals</span>
                    </div>
                    <div className="task-list">
                        <AnimatePresence mode="popLayout">
                            {incomplete.map((task) => <TaskCard key={task.id} task={task} />)}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {completed.length > 0 && (
                <div>
                    <div className="task-list-header">
                        <h3 className="task-list-title" style={{ color: 'var(--text-tertiary)' }}>Achieved</h3>
                        <span className="task-list-count">{completed.length} goals</span>
                    </div>
                    <div className="task-list">
                        <AnimatePresence mode="popLayout">
                            {completed.map((task) => <TaskCard key={task.id} task={task} />)}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {tasks.length === 0 && (
                <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="empty-state-icon">🎯</div>
                    <div className="empty-state-title">Set your yearly vision</div>
                    <div className="empty-state-text">Define big goals for {year} and break them into quarterly milestones.</div>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => openTaskModal()}>
                        <Plus size={16} style={{ marginRight: 4 }} /> Add Vision
                    </button>
                </motion.div>
            )}
        </div>
    );
}
