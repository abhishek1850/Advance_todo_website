import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Sparkles, Loader2, Plus, BrainCircuit,
    User as UserIcon, AlertTriangle,
    CheckCircle2, Trash2, Download, History,
    MessageCircle, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

export default function AssistantView() {
    const {
        user, addTask, getStreak, pendingAssistantMessage,
        setPendingAssistantMessage, getTodaysTasks,
        conversations, activeConversationMessages, activeConversationId,
        fetchConversations, setActiveConversation, sendAssistantMessage,
        clearConversation
    } = useStore();

    const tasks = getTodaysTasks();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (pendingAssistantMessage && !loading) {
            handleSend(pendingAssistantMessage);
            setPendingAssistantMessage(undefined);
        }
    }, [pendingAssistantMessage]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversationMessages]);

    const handleSend = async (messageText?: string) => {
        const textToSend = typeof messageText === 'string' ? messageText : input;
        if (!textToSend.trim() || !user) return;

        setInput('');
        setLoading(true);
        setError(null);

        try {
            const activeTasks = tasks.filter(t => !t.isCompleted).map(t => ({
                title: t.title, priority: t.priority, horizon: t.horizon, isRolledOver: t.isRolledOver
            }));
            const context = {
                pendingTasks: activeTasks,
                yesterdayCompletedCount: 0,
                streak: getStreak()
            };

            await sendAssistantMessage(textToSend, context);
        } catch (err: any) {
            setError(err.message || "An error occurred");
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
            recurrence: 'none',
            type: 'daily' as const
        });
    };

    return (
        <div className="assistant-layout">
            <div className="assistant-sidebar">
                <div className="sidebar-header">
                    <button
                        className="new-chat-btn"
                        onClick={() => setActiveConversation(null)}
                    >
                        <Plus size={18} />
                        New Mission
                    </button>
                </div>

                <div className="conversation-list">
                    <div className="list-label">
                        <History size={14} />
                        Recent Missions
                    </div>
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            className={`conv-item ${activeConversationId === conv.id ? 'active' : ''}`}
                            onClick={() => setActiveConversation(conv.id)}
                        >
                            <MessageCircle size={16} />
                            <div className="conv-content">
                                <span className="conv-title">{conv.title || 'Mission Log'}</span>
                                <span className="conv-date">{conv.lastMessageAt ? format(new Date(conv.lastMessageAt), 'MMM dd, HH:mm') : 'Recently'}</span>
                            </div>
                            <button
                                className="conv-delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Erase this mission data?')) clearConversation(conv.id);
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div className="empty-history">
                            No mission history yet.
                        </div>
                    )}
                </div>
            </div>

            <div className="chat-main">
                <div className="chat-header">
                    <div className="header-info">
                        <div className="icon-pulse">
                            <BrainCircuit size={24} color="var(--primary)" />
                        </div>
                        <div>
                            <h2>Productivity Intelligence</h2>
                            <p>{activeConversationId ? 'Continuing mission record...' : 'Ready for target briefing.'}</p>
                        </div>
                    </div>

                    <div className="header-actions">
                        {activeConversationMessages.length > 0 && (
                            <button
                                onClick={() => {
                                    const text = activeConversationMessages.map(m => `${m.role === 'user' ? 'You' : 'Coach'}: ${m.content}`).join('\n\n');
                                    const blob = new Blob([text], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `mission-data-${format(new Date(), 'yyyy-MM-dd')}.txt`;
                                    a.click();
                                }}
                                className="action-btn"
                                title="Export Data"
                            >
                                <Download size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="chat-container">
                    <AnimatePresence mode="popLayout">
                        {activeConversationMessages.length === 0 && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="welcome-state"
                            >
                                <div className="welcome-card">
                                    <Sparkles size={40} className="flash-icon" />
                                    <h3>Commander, awaiting orders.</h3>
                                    <p>I can help you coordinate your schedule or decimate complex tasks.</p>
                                    <div className="suggestion-grid">
                                        <button onClick={() => handleSend("Analyze my targets for today.")}>
                                            Analyse targets
                                            <ChevronRight size={14} />
                                        </button>
                                        <button onClick={() => handleSend("I need a strategic breakdown of my largest objective.")}>
                                            Strategic breakdown
                                            <ChevronRight size={14} />
                                        </button>
                                        <button onClick={() => handleSend("Optimize my morning routine for maximum focus.")}>
                                            Morning optimization
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeConversationMessages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`message-wrapper ${msg.role}`}
                            >
                                <div className="message-header">
                                    {msg.role === 'assistant' ? <Sparkles size={12} /> : <UserIcon size={12} />}
                                    <span>{msg.role === 'assistant' ? 'ARIES COMMAND' : 'COMMANDER'}</span>
                                    <span className="msg-time">{msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : '--:--'}</span>
                                </div>
                                <div className="message-bubble">
                                    <div className="bubble-content">
                                        {msg.content}
                                    </div>

                                    {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                                        <div className="suggested-tasks">
                                            <div className="suggested-header">SUGGESTED RECON TASKS</div>
                                            {msg.suggestedTasks.map((t: any, i: number) => {
                                                const exists = tasks.some(ex => ex.title.toLowerCase() === t.title.toLowerCase() && !ex.isCompleted);
                                                return (
                                                    <div key={i} className="suggested-item">
                                                        <div className="item-info">
                                                            <div className="item-title">
                                                                {t.title}
                                                                {exists && <span className="active-tag">Active</span>}
                                                            </div>
                                                            <div className="item-meta">
                                                                {String(t.priority || 'medium').toUpperCase()} • {t.estimatedTime}M • {t.reason}
                                                            </div>
                                                        </div>
                                                        {!exists ? (
                                                            <button className="add-task-btn" onClick={() => handleAddTask(t)}>
                                                                <Plus size={14} />
                                                            </button>
                                                        ) : (
                                                            <div className="completed-tag"><CheckCircle2 size={14} /></div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="message-wrapper assistant"
                            >
                                <div className="loading-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={scrollRef} style={{ height: 1 }} />
                </div>

                <div className="input-area">
                    {error && (
                        <div className="error-toast">
                            <AlertTriangle size={14} />
                            {error}
                        </div>
                    )}
                    <div className="input-wrapper">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Type your strategic inquiry..."
                            rows={1}
                        />
                        <button
                            className={`send-btn ${input.trim() ? 'active' : ''}`}
                            onClick={() => handleSend()}
                            disabled={loading || !input.trim()}
                        >
                            {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .assistant-layout {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    height: calc(100vh - 80px);
                    background: rgba(0,0,0,0.2);
                    border-radius: 24px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .assistant-sidebar {
                    background: rgba(255,255,255,0.02);
                    border-right: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem;
                }

                .new-chat-btn {
                    width: 100%;
                    padding: 0.75rem;
                    background: var(--gradient-primary);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
                    transition: all 0.2s;
                }

                .new-chat-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.4);
                }

                .list-label {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: rgba(255,255,255,0.3);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .conversation-list {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                }

                .conv-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 0.5rem;
                    border: 1px solid transparent;
                    position: relative;
                }

                .conv-item:hover {
                    background: rgba(255,255,255,0.05);
                }

                .conv-item.active {
                    background: rgba(var(--primary-rgb), 0.1);
                    border-color: rgba(var(--primary-rgb), 0.2);
                }

                .conv-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                }

                .conv-title {
                    font-size: 0.9rem;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .conv-date {
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.4);
                }

                .conv-delete {
                    opacity: 0;
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.3);
                    padding: 4px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .conv-item:hover .conv-delete {
                    opacity: 1;
                }

                .chat-main {
                    display: flex;
                    flex-direction: column;
                    background: rgba(0,0,0,0.1);
                }

                .chat-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .header-info h2 { font-size: 1.25rem; font-weight: 800; margin: 0; }
                .header-info p { font-size: 0.85rem; color: rgba(255,255,255,0.4); margin: 0; }

                .icon-pulse {
                    padding: 10px;
                    background: rgba(var(--primary-rgb), 0.1);
                    border-radius: 12px;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0.2); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(var(--primary-rgb), 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0); }
                }

                .chat-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .message-wrapper {
                    display: flex;
                    flex-direction: column;
                    max-width: 80%;
                }

                .message-wrapper.user { align-self: flex-end; }
                .message-wrapper.assistant { align-self: flex-start; }

                .message-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    color: rgba(255,255,255,0.3);
                    margin-bottom: 0.5rem;
                    padding: 0 0.5rem;
                }

                .user .message-header { flex-direction: row-reverse; }

                .message-bubble {
                    padding: 1.25rem;
                    border-radius: 20px;
                    position: relative;
                    font-size: 1rem;
                    line-height: 1.6;
                }

                .user .message-bubble {
                    background: var(--gradient-primary);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .assistant .message-bubble {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-bottom-left-radius: 4px;
                    backdrop-filter: blur(10px);
                }

                .bubble-content { white-space: pre-wrap; }

                .suggested-tasks {
                    margin-top: 1.5rem;
                    background: rgba(0,0,0,0.2);
                    border-radius: 16px;
                    padding: 1rem;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .suggested-header {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--primary);
                    margin-bottom: 0.75rem;
                }

                .suggested-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }

                .item-info { flex: 1; min-width: 0; }
                .item-title { font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
                .item-meta { font-size: 0.75rem; color: rgba(255,255,255,0.4); }

                .active-tag {
                    font-size: 0.6rem;
                    padding: 2px 6px;
                    background: rgba(var(--primary-rgb), 0.1);
                    color: var(--primary);
                    border-radius: 4px;
                }

                .add-task-btn {
                    padding: 6px;
                    background: #22c55e;
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .add-task-btn:hover { transform: scale(1.1); }

                .input-area {
                    padding: 1.5rem 2rem;
                    background: rgba(0,0,0,0.2);
                }

                .input-wrapper {
                    position: relative;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                    padding: 0.5rem;
                    display: flex;
                    align-items: flex-end;
                }

                .input-wrapper textarea {
                    flex: 1;
                    background: none;
                    border: none;
                    color: white;
                    padding: 0.75rem 1rem;
                    resize: none;
                    font-size: 1rem;
                    max-height: 150px;
                }

                .input-wrapper textarea:focus { outline: none; }

                .send-btn {
                    padding: 0.75rem;
                    background: rgba(255,255,255,0.05);
                    border: none;
                    border-radius: 12px;
                    color: rgba(255,255,255,0.2);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .send-btn.active {
                    background: var(--gradient-primary);
                    color: white;
                    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
                }

                .welcome-state {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .welcome-card {
                    text-align: center;
                    max-width: 500px;
                    padding: 3rem;
                    background: rgba(255,255,255,0.02);
                    border-radius: 32px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .flash-icon {
                    color: var(--primary);
                    margin-bottom: 2rem;
                    filter: drop-shadow(0 0 15px rgba(var(--primary-rgb), 0.4));
                }

                .suggestion-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.75rem;
                    margin-top: 2rem;
                }

                .suggestion-grid button {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 1rem;
                    border-radius: 16px;
                    color: rgba(255,255,255,0.7);
                    font-weight: 600;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .suggestion-grid button:hover {
                    background: rgba(255,255,255,0.07);
                    transform: translateX(4px);
                    color: white;
                }

                .loading-dots {
                    display: flex;
                    gap: 6px;
                    padding: 1rem;
                }

                .loading-dots span {
                    width: 6px; height: 6px;
                    background: var(--primary);
                    border-radius: 50%;
                    animation: dotPulse 1.4s infinite;
                }

                @keyframes dotPulse {
                    0%, 100% { opacity: 0.2; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }

                .error-toast {
                    background: rgba(255, 82, 82, 0.1);
                    border: 1px solid rgba(255, 82, 82, 0.2);
                    color: #ff5252;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                }

                .empty-history {
                    text-align: center;
                    padding: 2rem;
                    color: rgba(255,255,255,0.2);
                    font-style: italic;
                    font-size: 0.85rem;
                }

                @media (max-width: 1024px) {
                    .assistant-layout { grid-template-columns: 1fr; }
                    .assistant-sidebar { display: none; }
                }
            `}</style>
        </div>
    );
}
