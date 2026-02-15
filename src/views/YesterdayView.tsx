import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useStore } from '../store';
import TaskCard from '../components/TaskCard';
import ProgressRing from '../components/ProgressRing';
import type { TaskPriority } from '../types';
import { WeatherIcon } from '../components/MotivationEngine';
import { format, subDays } from 'date-fns';

export default function YesterdayView() {
    const { getYesterdayTasks } = useStore();
    const [search, setSearch] = useState('');
    const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');

    const tasks = getYesterdayTasks();
    const filtered = tasks.filter(t => {
        if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterPriority && t.priority !== filterPriority) return false;
        return true;
    });

    const incomplete = filtered.filter(t => !t.isCompleted);
    const completed = filtered.filter(t => t.isCompleted);

    // Calculate completion rate manually for yesterday view
    const rate = tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0;

    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    return (
        <div className="page-content">
            <div className="view-header">
                <div className="view-header-content">
                    <h2 className="view-title">Yesterday's Summary</h2>
                    <p className="view-subtitle">{format(subDays(new Date(), 1), 'MMMM d, yyyy')} • {completed.length} completed / {tasks.length} total</p>
                </div>
                <div className="view-header-actions">
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ProgressRing progress={rate} size={80} strokeWidth={6} />
                    </div>
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
                        <h3 className="task-list-title">Missed / Incomplete</h3>
                        <span className="task-list-count">{incomplete.length} tasks</span>
                    </div>
                    <div className="task-list">
                        <AnimatePresence mode="popLayout">
                            {incomplete.map((task) => <TaskCard key={task.id} task={task} date={yesterdayStr} />)}
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
                            {completed.map((task) => <TaskCard key={task.id} task={task} date={yesterdayStr} />)}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filtered.length === 0 && (
                <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="empty-state-icon"><WeatherIcon type="cloud-sun" size={64} /></div>
                    <div className="empty-state-title">No tasks found for yesterday</div>
                    <div className="empty-state-text">Check back tomorrow to see your daily history.</div>
                </motion.div>
            )}
        </div>
    );
}
