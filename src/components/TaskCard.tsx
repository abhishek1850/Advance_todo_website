import { motion } from 'framer-motion';
import { Check, Clock, Trash2, Edit3, Zap } from 'lucide-react';
import type { Task } from '../types';
import { useStore } from '../store';
import { format, parseISO, isPast, isToday } from 'date-fns';

interface TaskCardProps {
    task: Task;
    index?: number;
}

export default function TaskCard({ task, index = 0 }: TaskCardProps) {
    const { toggleTask, openTaskModal, deleteTask } = useStore();

    const isOverdue = task.dueDate && !task.isCompleted && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
    const isDueToday = task.dueDate && isToday(parseISO(task.dueDate));

    const completedSubtasks = task.subtasks.filter(s => s.isCompleted).length;
    const totalSubtasks = task.subtasks.length;
    const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
        <motion.div
            className={`task-card ${task.isCompleted ? 'completed' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            layout
        >
            <div className={`task-card-priority ${task.priority}`} />
            <div className="task-card-content">
                <motion.button
                    className={`task-checkbox ${task.isCompleted ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                    whileTap={{ scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                >
                    {task.isCompleted && <Check size={14} strokeWidth={3} />}
                </motion.button>
                <div className="task-info" onClick={() => openTaskModal(task)}>
                    <div className="task-title">{task.title}</div>
                    {task.description && <div className="task-description">{task.description}</div>}

                    {/* Subtask progress */}
                    {totalSubtasks > 0 && (
                        <div className="subtask-progress">
                            <div className="subtask-bar">
                                <div className="subtask-bar-fill" style={{ width: `${subtaskProgress}%` }} />
                            </div>
                            <span className="subtask-label">{completedSubtasks}/{totalSubtasks}</span>
                        </div>
                    )}

                    <div className="task-meta">
                        <span className="task-tag horizon">{task.horizon}</span>
                        <span className={`task-tag energy-${task.energyLevel}`}>
                            {task.energyLevel === 'low' ? '🔋' : task.energyLevel === 'medium' ? '⚡' : '🔥'}
                        </span>
                        <span className="task-tag xp">
                            <Zap size={10} style={{ marginRight: 2 }} />
                            {task.xpValue}
                        </span>
                        {task.estimatedMinutes > 0 && (
                            <span className="task-tag">
                                <Clock size={10} style={{ marginRight: 3 }} />
                                {task.estimatedMinutes}m
                            </span>
                        )}
                        {task.dueDate && (
                            <span className={`task-due ${isOverdue ? 'overdue' : ''} ${task.isRolledOver ? 'rollover' : ''}`}>
                                {task.isRolledOver ? '⚠️ Pending' : isDueToday ? '📌 Today' : isOverdue ? `⚠️ ${format(parseISO(task.dueDate), 'MMM d')}` : `📅 ${format(parseISO(task.dueDate), 'MMM d')}`}
                            </span>
                        )}
                    </div>
                </div>
                <div className="task-actions">
                    <button className="task-action-btn" onClick={(e) => { e.stopPropagation(); openTaskModal(task); }}><Edit3 size={14} /></button>
                    <button className="task-action-btn delete" onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}><Trash2 size={14} /></button>
                </div>
            </div>
        </motion.div>
    );
}
