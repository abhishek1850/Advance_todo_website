import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar } from 'lucide-react';
import { useStore } from '../store';
import TaskCard from '../components/TaskCard';
import ProgressRing from '../components/ProgressRing';
import { format } from 'date-fns';

export default function MonthlyView() {
    const { getMonthlyTasks, openTaskModal, getCompletionRate } = useStore();
    const [showCompleted, setShowCompleted] = useState(true);

    const tasks = getMonthlyTasks();
    const incomplete = tasks.filter(t => !t.isCompleted);
    const completed = tasks.filter(t => t.isCompleted);
    const rate = getCompletionRate('monthly');
    const monthName = format(new Date(), 'MMMM yyyy');

    return (
        <div className="page-content">
            <div className="view-header">
                <div className="view-header-content">
                    <h2 className="view-title">
                        <Calendar size={28} style={{ marginRight: 8, color: 'var(--accent-secondary)' }} />
                        {monthName}
                    </h2>
                    <p className="view-subtitle">{incomplete.length} remaining • {completed.length} completed</p>
                </div>
                <div className="view-header-actions">
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ProgressRing progress={rate} size={80} strokeWidth={6} color="#00cec9" />
                    </div>
                    <button className="btn btn-primary" onClick={() => openTaskModal()}>
                        <Plus size={16} style={{ marginRight: 4 }} /> Add Goal
                    </button>
                </div>
            </div>

            {/* Milestone Progress */}
            {tasks.length > 0 && (
                <motion.div className="card" style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="card-title">Month Progress</div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                        {['Work', 'Personal', 'Health', 'Learning'].map(cat => {
                            const catTasks = tasks.filter(t => t.category === cat);
                            if (!catTasks.length) return null;
                            const catDone = catTasks.filter(t => t.isCompleted).length;
                            return (
                                <div key={cat} style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8 }}>{cat}</div>
                                    <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                                        <motion.div style={{ height: '100%', background: 'var(--gradient-secondary)', borderRadius: 2 }} initial={{ width: 0 }} animate={{ width: `${(catDone / catTasks.length) * 100}%` }} transition={{ duration: 0.8 }} />
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{catDone}/{catTasks.length}</div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {incomplete.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <div className="task-list-header">
                        <h3 className="task-list-title">In Progress</h3>
                        <span className="task-list-count">{incomplete.length} goals</span>
                    </div>
                    <div className="task-list">
                        <AnimatePresence mode="popLayout">
                            {incomplete.map((task, i) => <TaskCard key={task.id} task={task} />)}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {completed.length > 0 && (
                <div>
                    <div className="task-list-header" onClick={() => setShowCompleted(!showCompleted)} style={{ cursor: 'pointer' }}>
                        <h3 className="task-list-title" style={{ color: 'var(--text-tertiary)' }}>Completed {showCompleted ? '▼' : '▶'}</h3>
                        <span className="task-list-count">{completed.length} goals</span>
                    </div>
                    <AnimatePresence>
                        {showCompleted && (
                            <motion.div className="task-list" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                {completed.map((task, i) => <TaskCard key={task.id} task={task} />)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {tasks.length === 0 && (
                <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="empty-state-icon">📅</div>
                    <div className="empty-state-title">No monthly goals yet</div>
                    <div className="empty-state-text">Set goals for {monthName} and track milestones throughout the month.</div>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => openTaskModal()}>
                        <Plus size={16} style={{ marginRight: 4 }} /> Add Goal
                    </button>
                </motion.div>
            )}
        </div>
    );
}
