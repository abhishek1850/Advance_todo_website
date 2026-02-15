import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { useStore } from '../store';
import type { TaskHorizon, TaskPriority, EnergyLevel, RecurrencePattern } from '../types';
import { format } from 'date-fns';
import { WeatherIcon } from './MotivationEngine';

const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Finance', 'Social', 'Creative', 'Errands'];

export default function TaskModal() {
    const { isTaskModalOpen, editingTask, closeTaskModal, addTask, updateTask, deleteTask } = useStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [horizon, setHorizon] = useState<TaskHorizon>('daily');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [category, setCategory] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [recurrence, setRecurrence] = useState<RecurrencePattern>('none');
    const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
    const [estimatedMinutes, setEstimatedMinutes] = useState(30);
    const [tags, setTags] = useState('');

    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title);
            setDescription(editingTask.description);
            setHorizon(editingTask.horizon);
            setPriority(editingTask.priority);
            setCategory(editingTask.category);
            setDueDate(editingTask.dueDate ? format(new Date(editingTask.dueDate), 'yyyy-MM-dd') : '');
            setRecurrence(editingTask.recurrence);
            setEnergyLevel(editingTask.energyLevel);
            setEstimatedMinutes(editingTask.estimatedMinutes);
            setTags(editingTask.tags.join(', '));
        } else {
            setTitle(''); setDescription(''); setHorizon('daily'); setPriority('medium');
            setCategory(''); setDueDate(format(new Date(), 'yyyy-MM-dd')); setRecurrence('none');
            setEnergyLevel('medium'); setEstimatedMinutes(30); setTags('');
        }
    }, [editingTask, isTaskModalOpen]);

    // Sanitize text input
    const sanitize = (text: string, maxLen: number) => text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, maxLen);

    const handleSubmit = () => {
        const cleanTitle = sanitize(title, 200);
        if (!cleanTitle) return;
        const taskData = {
            title: cleanTitle,
            description: sanitize(description, 1000),
            horizon, priority, category: sanitize(category, 50),
            dueDate: dueDate ? new Date(dueDate).toISOString() : '',
            recurrence, energyLevel, estimatedMinutes: Math.min(Math.max(estimatedMinutes, 5), 480),
            tags: tags.split(',').map(t => sanitize(t, 30)).filter(Boolean).slice(0, 10),
            subtasks: editingTask?.subtasks || [],
            type: recurrence === 'daily' ? 'daily' : 'one-time' as 'daily' | 'one-time'
        };
        if (editingTask) {
            updateTask(editingTask.id, taskData);
        } else {
            addTask(taskData);
        }
        closeTaskModal();
    };

    const handleDelete = () => {
        if (editingTask) { deleteTask(editingTask.id); closeTaskModal(); }
    };

    return (
        <AnimatePresence>
            {isTaskModalOpen && (
                <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeTaskModal}>
                    <motion.div className="modal" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingTask ? 'Edit Task' : 'New Task'}</h2>
                            <button className="modal-close" onClick={closeTaskModal}><X size={20} /></button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input className="form-input" value={title} onChange={e => setTitle(e.target.value.slice(0, 200))} placeholder="What needs to be done?" maxLength={200} autoFocus />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value.slice(0, 1000))} placeholder="Add details..." maxLength={1000} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Time Horizon</label>
                                <div className="horizon-selector">
                                    {(['daily', 'monthly', 'yearly'] as TaskHorizon[]).map(h => (
                                        <button key={h} className={`horizon-option ${horizon === h ? 'active' : ''}`} onClick={() => setHorizon(h)}>
                                            <div className="horizon-option-icon">{h === 'daily' ? <WeatherIcon type="sun" size={24} /> : h === 'monthly' ? '📅' : '🎯'}</div>
                                            <div className="horizon-option-label">{h.charAt(0).toUpperCase() + h.slice(1)}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <div className="priority-selector">
                                    {(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map(p => (
                                        <button key={p} className={`priority-option ${priority === p ? `active ${p}` : ''}`} onClick={() => setPriority(p)}>
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                                        <option value="" style={{ backgroundColor: '#1e1e2e', color: 'white' }}>Select...</option>
                                        {CATEGORIES.map(c => <option key={c} value={c} style={{ backgroundColor: '#1e1e2e', color: 'white' }}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Due Date</label>
                                    <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Recurrence</label>
                                    <select className="form-select" value={recurrence} onChange={e => setRecurrence(e.target.value as RecurrencePattern)}>
                                        <option value="none" style={{ backgroundColor: '#1e1e2e', color: 'white' }}>None</option>
                                        <option value="daily" style={{ backgroundColor: '#1e1e2e', color: 'white' }}>Daily</option>
                                        <option value="weekdays" style={{ backgroundColor: '#1e1e2e', color: 'white' }}>Weekdays</option>
                                        <option value="weekly" style={{ backgroundColor: '#1e1e2e', color: 'white' }}>Weekly</option>
                                        <option value="biweekly" style={{ backgroundColor: '#1e1e2e', color: 'white' }}>Bi-weekly</option>
                                        <option value="monthly" style={{ backgroundColor: '#1e1e2e', color: 'white' }}>Monthly</option>
                                        <option value="quarterly" style={{ backgroundColor: '#1e1e2e', color: 'white' }}>Quarterly</option>
                                        <option value="yearly" style={{ backgroundColor: '#1e1e2e', color: 'white' }}>Yearly</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Energy Level</label>
                                    <div className="priority-selector">
                                        {(['low', 'medium', 'high'] as EnergyLevel[]).map(e => (
                                            <button key={e} className={`priority-option ${energyLevel === e ? `active ${e === 'low' ? 'low' : e === 'medium' ? 'medium' : 'high'}` : ''}`} onClick={() => setEnergyLevel(e)}>
                                                {e === 'low' ? '🔋' : e === 'medium' ? '⚡' : '🔥'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Estimated Time (minutes)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => setEstimatedMinutes(Math.max(5, estimatedMinutes - 5))}><Minus size={16} /></button>
                                    <span style={{ fontSize: 18, fontWeight: 700, minWidth: 50, textAlign: 'center' }}>{estimatedMinutes}</span>
                                    <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => setEstimatedMinutes(estimatedMinutes + 5)}><Plus size={16} /></button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tags (comma separated)</label>
                                <input className="form-input" value={tags} onChange={e => setTags(e.target.value.slice(0, 200))} placeholder="e.g. urgent, project-x" maxLength={200} />
                            </div>
                        </div>

                        <div className="modal-footer">
                            {editingTask && <button className="btn btn-danger" onClick={handleDelete} style={{ marginRight: 'auto' }}>Delete</button>}
                            <button className="btn btn-secondary" onClick={closeTaskModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSubmit}>{editingTask ? 'Update' : 'Create Task'}</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
