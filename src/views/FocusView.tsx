import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FocusTimer from '../components/FocusTimer';
import { useStore } from '../store';
import { Quote } from 'lucide-react';
import type { Task } from '../types';
import { decodeHTMLEntities } from '../lib/sanitize';

export default function FocusView() {
    const { getTodaysTasks } = useStore();
    const tasks = getTodaysTasks().filter(t => !t.isCompleted);
    const [currentTask, setCurrentTask] = useState<Task | null>(tasks[0] || null);

    useEffect(() => {
        // Update task if tasks change
        const incomplete = getTodaysTasks().filter(t => !t.isCompleted);
        if (incomplete.length > 0) {
            setCurrentTask(incomplete[0]);
        } else {
            setCurrentTask(null);
        }
    }, []);

    return (
        <div className="page-content" style={{
            height: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Ambient Effect */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(124, 108, 240, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}
            >
                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
                        Deep Focus
                    </h2>
                    {currentTask ? (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 16,
                            padding: '16px 24px',
                            marginTop: 16
                        }}>
                            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--accent-primary)', marginBottom: 4 }}>
                                Current Task
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 500 }}>
                                {decodeHTMLEntities(currentTask.title)}
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-tertiary)' }}>No active tasks. Enjoy your break!</p>
                    )}
                </div>

                {/* Scaled Up Timer */}
                <div style={{ transform: 'scale(1.5)', transformOrigin: 'center', marginBottom: 48, display: 'flex', justifyContent: 'center' }}>
                    <FocusTimer />
                </div>

                <div style={{
                    marginTop: 32,
                    padding: 24,
                    opacity: 0.7,
                    fontStyle: 'italic',
                    fontSize: 14,
                    color: 'var(--text-tertiary)',
                    maxWidth: 300,
                    margin: '0 auto'
                }}>
                    <Quote size={24} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.5 }} />
                    "The successful warrior is the average man, with laser-like focus."
                </div>
            </motion.div>
        </div>
    );
}
