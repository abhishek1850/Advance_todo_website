import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { useStore } from '../store';
import TaskCard from '../components/TaskCard';
import ProgressRing from '../components/ProgressRing';
import type { TaskPriority } from '../types';

export default function TodayView() {
    const { getTodaysTasks, openTaskModal, getCompletionRate } = useStore();
    const [search, setSearch] = useState('');
    const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');

    const tasks = getTodaysTasks();
    const filtered = tasks.filter(t => {
        if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterPriority && t.priority !== filterPriority) return false;
        return true;
    });

    const incomplete = filtered.filter(t => !t.isCompleted);
    const completed = filtered.filter(t => t.isCompleted);
    const rate = getCompletionRate('daily');

    return (
        <div className="page-content">
            <div className="view-header">
                <div className="view-header-content">
                    <h2 className="view-title">Today's Tasks</h2>
                    <p className="view-subtitle">{incomplete.length} remaining • {completed.length} completed</p>
                </div>
                <div className="view-header-actions">
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ProgressRing progress={rate} size={80} strokeWidth={6} />
                    </div>
                    <button className="btn btn-primary" onClick={() => openTaskModal()}>
                        <Plus size={16} style={{ marginRight: 4 }} /> Add Task
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-tertiary)' }} />
                    <input className="form-input" style={{ paddingLeft: 36, maxWidth: 260 }} placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className={`filter-chip ${filterPriority === '' ? 'active' : ''}`} onClick={() => setFilterPriority('')}>All</button>
                {(['critical', 'high', 'medium', 'low'] as TaskPriority[]).map(p => (
                    <button key={p} className={`filter-chip ${filterPriority === p ? 'active' : ''}`} onClick={() => setFilterPriority(filterPriority === p ? '' : p)}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                ))}
            </div>

            {/* Incomplete Tasks */}
            {incomplete.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <div className="task-list-header">
                        <h3 className="task-list-title">To Do</h3>
                        <span className="task-list-count">{incomplete.length} tasks</span>
                    </div>
                    <div className="task-list">
                        <AnimatePresence mode="popLayout">
                            {incomplete.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Completed Tasks */}
            {completed.length > 0 && (
                <div>
                    <div className="task-list-header">
                        <h3 className="task-list-title" style={{ color: 'var(--text-tertiary)' }}>Completed</h3>
                        <span className="task-list-count">{completed.length} tasks</span>
                    </div>
                    <div className="task-list">
                        <AnimatePresence mode="popLayout">
                            {completed.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filtered.length === 0 && (
                <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="empty-state-icon">☀️</div>
                    <div className="empty-state-title">No tasks for today</div>
                    <div className="empty-state-text">Add daily tasks to start building your productivity streak!</div>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => openTaskModal()}>
                        <Plus size={16} style={{ marginRight: 4 }} /> Add Task
                    </button>
                </motion.div>
            )}
        </div>
    );
}
