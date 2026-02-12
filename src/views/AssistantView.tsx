import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2, Plus, BrainCircuit, User as UserIcon, MessageSquare, AlertTriangle } from 'lucide-react';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { AIChatMessage } from '../types';
import { format } from 'date-fns';
import { generateAIResponse } from '../lib/ai';

export default function AssistantView() {
    const { user, tasks, addTask, getStreak } = useStore();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<AIChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'ai_chats'),
            where('userId', '==', user.uid)
            // Removed orderBy to avoid requiring a composite index, which might be causing the crash or permission issues
            // orderBy('createdAt', 'asc') 
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AIChatMessage[];

            // Sort client-side
            msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            setMessages(msgs);
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, (err) => {
            console.error("Firestore Snapshot Error:", err);
            setError("Failed to load history: " + err.message);
        });

        return () => unsubscribe();
    }, [user]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;
        const userMsg = input.trim().slice(0, 1000); // Security: limit message length
        if (userMsg.length < 2) return;
        setInput('');
        setLoading(true);
        setError(null);

        try {
            // 1. Save User Message
            try {
                await addDoc(collection(db, 'ai_chats'), {
                    userId: user.uid,
                    role: 'user',
                    content: userMsg,
                    createdAt: new Date().toISOString()
                });
            } catch (e) {
                console.error("Firestore Error (User Message):", e);
                throw new Error("Could not send message. Check internet connection.");
            }

            // 2. Prepare Context
            const activeTasks = tasks.filter(t => !t.isCompleted).map(t => ({ title: t.title, priority: t.priority, horizon: t.horizon }));
            const context = {
                pendingTasks: activeTasks,
                yesterdayCompletedCount: 0,
                streak: getStreak()
            };

            // 3. Get AI Response
            let data;
            try {
                data = await generateAIResponse(userMsg, context, user.uid);
            } catch (e: any) {
                throw new Error(e.message || "AI is temporarily unavailable. Please try again.");
            }

            if (!data) throw new Error("No response from AI");

            // 4. Save AI Response
            try {
                await addDoc(collection(db, 'ai_chats'), {
                    userId: user.uid,
                    role: 'assistant',
                    content: data.reflection + '\n\n' + data.focusAdvice,
                    suggestedTasks: data.suggestedTasks,
                    createdAt: new Date().toISOString()
                });
            } catch (e) {
                console.error("Firestore Error (AI Message):", e);
                // If we got the AI response but failed to save, at least show it temporarily?
                // For now, just error out.
                throw new Error("Failed to save AI response.");
            }

        } catch (err: any) {
            setError(err.message || "An error occurred");

            // Try to log to firestore if possible, but don't rely on it
            try {
                await addDoc(collection(db, 'ai_chats'), {
                    userId: user.uid,
                    role: 'assistant',
                    content: `Error: ${err.message || "Something went wrong."}`,
                    createdAt: new Date().toISOString()
                });
            } catch (ignore) { }
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = (task: any) => {
        addTask({
            title: task.title,
            description: 'AI Suggested Task',
            priority: task.priority?.toLowerCase() || 'medium',
            horizon: 'daily',
            category: 'Work',
            dueDate: format(new Date(), 'yyyy-MM-dd'),
            energyLevel: 'medium',
            estimatedMinutes: parseInt(task.estimatedTime) || 30,
            subtasks: [],
            tags: ['AI Suggested'],
            recurrence: 'none'
        });
    };

    return (
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', maxWidth: 900, margin: '0 auto' }}>
            <div className="chat-header" style={{ marginBottom: 20, textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: 12, background: 'rgba(124, 108, 240, 0.1)', borderRadius: 16, marginBottom: 12 }}>
                    <BrainCircuit size={32} color="var(--accent-primary)" />
                </div>
                <h1>AI Productivity Coach</h1>
                <p style={{ color: 'var(--text-tertiary)' }}>Tell me about your day, and I'll help you plan it perfectly.</p>
            </div>

            <div className="chat-container" style={{ flex: 1, overflowY: 'auto', padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {error && (
                    <div style={{ background: 'rgba(255, 82, 82, 0.1)', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', padding: 12, borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: 40 }}>
                        <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <p>No messages yet. Start by saying "Help me plan my day!"</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`message ${msg.role}`}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-card)',
                            color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                            padding: 16,
                            borderRadius: 16,
                            borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                            borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, opacity: 0.7, fontSize: 12 }}>
                            {msg.role === 'assistant' ? <Sparkles size={12} /> : <UserIcon size={12} />}
                            <span>{msg.role === 'assistant' ? 'Coach' : 'You'}</span>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {msg.content}
                        </div>

                        {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                            <div style={{ marginTop: 16, background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--accent-primary)' }}>SUGGESTED TASKS</div>
                                {msg.suggestedTasks.map((t: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{t.title}</div>
                                            <div style={{ fontSize: 12, opacity: 0.7 }}>{t.priority} • {t.estimatedTime}m • {t.reason}</div>
                                        </div>
                                        <button
                                            onClick={() => handleAddTask(t)}
                                            className="btn-icon"
                                            style={{ background: 'var(--accent-success)', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Add to My Tasks"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ alignSelf: 'flex-start', background: 'var(--bg-card)', padding: 16, borderRadius: 16, borderBottomLeftRadius: 4 }}
                    >
                        <div style={{ display: 'flex', gap: 6 }}>
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: 6, height: 6, background: 'var(--text-tertiary)', borderRadius: '50%' }} />
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} style={{ width: 6, height: 6, background: 'var(--text-tertiary)', borderRadius: '50%' }} />
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: 6, height: 6, background: 'var(--text-tertiary)', borderRadius: '50%' }} />
                        </div>
                    </motion.div>
                )}
                <div ref={scrollRef} />
            </div>

            <div className="chat-input" style={{ marginTop: 20 }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value.slice(0, 1000))}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for a plan, or just vent about your workload..."
                        maxLength={1000}
                        style={{
                            width: '100%', padding: '16px 50px 16px 20px',
                            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                            borderRadius: 24, color: 'var(--text-primary)', fontSize: 16,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        style={{
                            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                            width: 36, height: 36, borderRadius: '50%',
                            background: input.trim() ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                            color: 'white', border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                    </button>
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
                    AI can make mistakes. Please verify important info.
                </div>
            </div>
        </div>
    );
}
