import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Sparkles, Loader2, Plus, BrainCircuit,
    User as UserIcon, AlertTriangle,
    CheckCircle2, Trash2, Download, History,
    MessageCircle, ChevronRight, Terminal, Activity,
    Globe, Lock, Info, Cpu, Menu, X
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
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile drawer state
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
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileSidebarOpen(false)}
                        className="sidebar-overlay"
                    />
                )}
            </AnimatePresence>

            <div className={`assistant-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-mobile-header">
                    <span>MISSION LOGS</span>
                    <button onClick={() => setMobileSidebarOpen(false)}><X size={20} /></button>
                </div>
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
                            onClick={() => {
                                setActiveConversation(conv.id);
                                setMobileSidebarOpen(false); // Close on selection
                            }}
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
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileSidebarOpen(true)}
                    >
                        <Menu size={20} />
                    </button>
                    <div className="header-info">
                        <div className="icon-pulse desktop-only">
                            <BrainCircuit size={28} color="var(--primary)" />
                        </div>
                        <div className="header-text">
                            <div className="header-top">
                                <h2>ARIES COMMAND</h2>
                                <div className="status-badge pulse">
                                    <Activity size={10} />
                                    <span>PLATFORM: SECURE • NEURAL SYNC ACTIVE</span>
                                </div>
                                <div className="edge-badge">EDGE</div>
                            </div>
                            <p>{activeConversationId ? 'Secure communication line active...' : 'System initialized. Waiting for strategic input.'}</p>
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
                    <div className="neural-grid" />
                    <AnimatePresence mode="popLayout">
                        {activeConversationMessages.length === 0 && !loading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="welcome-state"
                            >
                                <div className="welcome-card shadow-premium">
                                    <div className="welcome-icon-wrapper">
                                        <motion.div
                                            className="icon-ring"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        />
                                        <motion.div
                                            className="icon-ring-outer"
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                        />
                                        <Sparkles size={48} className="welcome-primary-icon" />
                                    </div>
                                    <h3>Commander, awaiting briefing.</h3>
                                    <p>I am ARIES v3.1—your strategic intelligence engine. I optimize pathfinding for your objectives and coordinate your daily operations.</p>

                                    <div className="system-stats">
                                        <div className="stat-pill"><Cpu size={12} /> Neural Core</div>
                                        <div className="stat-pill"><Lock size={12} /> Encrypted</div>
                                        <div className="stat-pill"><Globe size={12} /> Sync: Online</div>
                                    </div>

                                    <div className="suggestion-grid">
                                        {[
                                            { text: "Analyze my targets for today.", label: "Mission Analysis", icon: <Activity size={16} />, desc: "Tactical overview" },
                                            { text: "I need a strategic breakdown of my largest objective.", label: "Objective Decimation", icon: <Terminal size={16} />, desc: "Split big goals" },
                                            { text: "Optimize my morning routine for maximum focus.", label: "Workflow Logic", icon: <BrainCircuit size={16} />, desc: "Focus optimization" }
                                        ].map((s, idx) => (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ x: 8, backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}
                                                onClick={() => handleSend(s.text)}
                                                className="suggestion-btn"
                                            >
                                                <div className="btn-left">
                                                    <div className="btn-icon-box">{s.icon}</div>
                                                    <div className="btn-text-content">
                                                        <span className="btn-label">{s.label}</span>
                                                        <span className="btn-desc">{s.desc}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="chevron" />
                                            </motion.button>
                                        ))}
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
                                        {msg.content.split('\n').map((line, i) => (
                                            <p key={i} style={{ marginBottom: line.trim() ? '1.2rem' : '0.5rem' }}>{line}</p>
                                        ))}
                                    </div>

                                    {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                                        <div className="suggested-tasks">
                                            <div className="suggested-header">SUGGESTED RECON TASKS</div>
                                            <div className="tasks-grid">
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
                                                                    <span className={`priority-tag ${String(t.priority || 'medium').toLowerCase()}`}>{String(t.priority || 'medium').toUpperCase()}</span>
                                                                    <span className="meta-separator">•</span>
                                                                    <span className="time-tag">{t.estimatedTime}M</span>
                                                                    <span className="meta-separator">•</span>
                                                                    <span className="reason-tag">{t.reason}</span>
                                                                </div>
                                                            </div>
                                                            {!exists ? (
                                                                <button className="add-task-icon-btn" onClick={() => handleAddTask(t)}>
                                                                    <Plus size={16} />
                                                                </button>
                                                            ) : (
                                                                <div className="completed-icon-tag"><CheckCircle2 size={16} /></div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="message-wrapper assistant loading-state"
                            >
                                <div className="message-header">
                                    <Sparkles size={12} className="spinning-icon" />
                                    <span>ARIES PROCESSING...</span>
                                </div>
                                <div className="loading-bubble">
                                    <div className="loading-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <div className="loading-text">Synchronizing neural pathways...</div>
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
                    <div className="input-feedback">
                        <div className="neural-link">
                            <div className="link-dot" />
                            <span>Neural Link Ready</span>
                        </div>
                        <div className="char-count">{input.length}/2000</div>
                    </div>
                    <div className="input-wrapper">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value.slice(0, 2000))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Briefing code or strategic inquiry..."
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
                    <div className="input-footer">
                        <Info size={10} />
                        <span>ARIES may provide analytical errors. Verify mission-critical data.</span>
                    </div>
                </div>
            </div>

            <style>{`
                .assistant-layout {
                    display: grid;
                    grid-template-columns: 310px 1fr;
                    height: calc(100vh - 100px);
                    background: rgba(8, 8, 12, 0.4);
                    border-radius: 32px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                    backdrop-filter: blur(20px);
                }

                .assistant-sidebar {
                    background: rgba(255,255,255,0.015);
                    border-right: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    flex-direction: column;
                    padding: 2rem;
                    overflow: hidden; /* CRITICAL: Prevent sidebar from expanding */
                }

                .new-chat-btn {
                    width: 100%;
                    padding: 1rem;
                    background: var(--gradient-primary);
                    border: none;
                    border-radius: 16px;
                    color: white;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    margin-bottom: 2.5rem;
                    box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-transform: uppercase;
                    font-size: 0.85rem;
                    letter-spacing: 1px;
                }

                .new-chat-btn:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.5);
                }

                .list-label {
                    font-size: 0.75rem;
                    font-weight: 900;
                    color: rgba(255,255,255,0.25);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .conversation-list {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none;  /* IE and Edge */
                    min-height: 0; /* Help flexbox know when to scroll */
                }

                .conversation-list::-webkit-scrollbar { 
                    display: none; /* Chrome, Safari and Opera */
                }

                .conv-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.25s;
                    margin-bottom: 0.75rem;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.03);
                    position: relative;
                }

                .conv-item:hover {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(255,255,255,0.1);
                    transform: translateX(4px);
                }

                .conv-item.active {
                    background: rgba(var(--primary-rgb), 0.12);
                    border-color: rgba(var(--primary-rgb), 0.3);
                    box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.1);
                }

                .conv-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .conv-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.9);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .conv-date {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.4);
                }

                .chat-header {
                    padding: 1.75rem 2.5rem;
                    background: rgba(255,255,255,0.01);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    backdrop-filter: blur(10px);
                }

                .header-info { display: flex; align-items: center; gap: 1.25rem; }
                .header-text { display: flex; flex-direction: column; gap: 4px; }
                .header-top { display: flex; align-items: center; gap: 0.75rem; }
                .header-info h2 { font-size: 1.4rem; font-weight: 900; margin: 0; letter-spacing: 1px; color: white; }
                .header-info p { font-size: 0.85rem; color: rgba(255,255,255,0.4); margin: 0; }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    border-radius: 20px;
                    color: #22c55e;
                    font-size: 0.65rem;
                    font-weight: 900;
                    letter-spacing: 0.5px;
                }

                .status-badge.pulse span { animation: blink 2s infinite; }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

                .icon-pulse {
                    padding: 12px;
                    background: rgba(var(--primary-rgb), 0.15);
                    border-radius: 16px;
                    box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.2);
                }

                .chat-container {
                    padding: 2.5rem;
                    gap: 2rem;
                    scroll-behavior: smooth;
                    position: relative;
                    overflow-x: hidden;
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    min-height: 0; /* CRITICAL for flex scrolling */
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none;  /* IE and Edge */
                }

                .chat-container::-webkit-scrollbar { 
                    display: none; /* Chrome, Safari and Opera */
                }

                .neural-grid {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
                    background-size: 30px 30px;
                    pointer-events: none;
                    opacity: 0.5;
                }

                .message-bubble {
                    padding: 1.5rem 2rem;
                    border-radius: 20px;
                    font-size: 1rem;
                    line-height: 1.6;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    position: relative;
                }

                .user .message-bubble {
                    background: linear-gradient(135deg, var(--primary) 0%, #6d28d9 100%);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    font-weight: 500;
                }

                .assistant .message-bubble {
                    background: rgba(18, 18, 28, 0.45);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 400;
                    letter-spacing: 0.2px;
                }

                .bubble-content p:last-child { margin-bottom: 0 !important; }

                .welcome-card {
                    padding: 4rem;
                    border-radius: 40px;
                    max-width: 650px;
                    text-align: center;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(10, 10, 15, 0.4);
                    backdrop-filter: blur(20px);
                    z-index: 10;
                    margin: auto;
                }

                .welcome-icon-wrapper {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-ring, .icon-ring-outer {
                    position: absolute;
                    border: 2px dashed var(--primary);
                    border-radius: 50%;
                    opacity: 0.2;
                }

                .icon-ring { width: 100%; height: 100%; }
                .icon-ring-outer { width: 140%; height: 140%; opacity: 0.1; }

                .welcome-primary-icon {
                    color: var(--primary);
                    filter: drop-shadow(0 0 25px rgba(var(--primary-rgb), 0.6));
                }

                .welcome-card h3 { font-size: 2.2rem; font-weight: 900; margin-bottom: 1rem; color: white; letter-spacing: -0.5px; }
                .welcome-card p { font-size: 1.05rem; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 2.5rem; max-width: 480px; margin-left: auto; margin-right: auto; }

                .suggestion-btn {
                    padding: 1rem 1.75rem !important;
                    background: rgba(255,255,255,0.02) !important;
                    border: 1px solid rgba(255,255,255,0.04) !important;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 20px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    width: 100%;
                }

                .btn-icon-box {
                    width: 40px; height: 40px;
                    background: rgba(var(--primary-rgb), 0.1);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .btn-left { display: flex; align-items: center; gap: 1rem; text-align: left; }

                .btn-text-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .btn-label { font-size: 0.95rem; font-weight: 700; color: white; }
                .btn-desc { font-size: 0.75rem; color: rgba(255,255,255,0.3); font-weight: 500; }

                .loading-bubble {
                    background: rgba(20, 20, 30, 0.5);
                    border: 1px solid rgba(var(--primary-rgb), 0.2);
                    box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.1);
                    padding: 1rem 1.5rem;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .suggested-tasks {
                    margin-top: 1.5rem;
                    padding: 1.5rem;
                    background: rgba(0,0,0,0.25);
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.03);
                }

                .suggested-header {
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    color: rgba(255,255,255,0.25);
                    margin-bottom: 1.25rem;
                    text-transform: uppercase;
                }

                .tasks-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .suggested-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.03);
                    border-radius: 12px;
                    transition: all 0.2s ease;
                }

                .suggested-item:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.06);
                }

                .item-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.35rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .item-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.4);
                    font-weight: 500;
                }

                .priority-tag { font-weight: 700; font-size: 0.65rem; }
                .priority-tag.high { color: #f87171; }
                .priority-tag.medium { color: #fbbf24; }
                .priority-tag.low { color: #34d399; }
                .priority-tag.critical { color: #ef4444; }

                .meta-separator { opacity: 0.2; }
                .reason-tag { color: rgba(255,255,255,0.3); }

                .add-task-icon-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #22c55e;
                    border: none;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
                }

                .add-task-icon-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
                }

                .completed-icon-tag {
                    color: #22c55e;
                    opacity: 0.6;
                }

                .input-feedback {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    padding: 0 0.5rem;
                }

                .neural-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #7c6cf0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .edge-badge {
                    font-size: 0.6rem;
                    font-weight: 900;
                    background: #fff;
                    color: #000;
                    padding: 1px 4px;
                    border-radius: 3px;
                    margin-left: 8px;
                    letter-spacing: 0.5px;
                }

                .link-dot {
                    width: 6px; height: 6px;
                    background: #7c6cf0;
                    border-radius: 50%;
                    box-shadow: 0 0 8px #7c6cf0;
                    animation: blink 1.5s infinite;
                }

                .char-count {
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.3);
                    font-weight: 600;
                }

                .input-footer {
                    margin-top: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 0.65rem;
                    color: rgba(255,255,255,0.2);
                    font-weight: 500;
                }

                .chat-main {
                    display: flex;
                    flex-direction: column;
                    background: rgba(0,0,0,0.1);
                    flex: 1;
                    overflow: hidden; /* Prevent parent from expanding */
                    min-width: 0;
                }

                .message-wrapper {
                    display: flex;
                    flex-direction: column;
                    max-width: 80%;
                    z-index: 5;
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

                .input-area {
                    padding: 2rem 2.5rem;
                    background: rgba(0,0,0,0.3);
                    backdrop-filter: blur(20px);
                }

                .input-wrapper {
                    position: relative;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 24px;
                    padding: 0.75rem;
                    display: flex;
                    align-items: flex-end;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .input-wrapper textarea {
                    flex: 1;
                    background: none;
                    border: none;
                    color: white;
                    padding: 0.75rem 1.25rem;
                    resize: none;
                    font-size: 1.1rem;
                    max-height: 150px;
                }

                .input-wrapper textarea:focus { outline: none; }

                .send-btn {
                    width: 48px;
                    height: 48px;
                    background: rgba(255,255,255,0.05);
                    border: none;
                    border-radius: 16px;
                    color: rgba(255,255,255,0.2);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .send-btn.active {
                    background: var(--gradient-primary);
                    color: white;
                    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
                }

                .loading-dots {
                    display: flex;
                    gap: 6px;
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

                .spinning-icon { animation: spin 4s linear infinite; color: var(--primary); }
                @keyframes spin { from { rotate: 0deg; } to { rotate: 360deg; } }

                .conv-content { display: flex; flex-direction: column; }
                .conv-title { font-weight: 700; color: white; }
                .conv-delete { background: none; border: none; color: rgba(255,255,255,0.2); cursor: pointer; padding: 4px; border-radius: 4px; }
                .conv-delete:hover { color: #ff5252; background: rgba(255, 82, 82, 0.1); }
                .header-actions { display: flex; gap: 0.5rem; }
                .action-btn { background: rgba(255,255,255,0.05); border: none; color: white; padding: 8px; border-radius: 10px; cursor: pointer; }

                .desktop-only { display: block; }
                .mobile-menu-toggle { display: none; }
                .sidebar-mobile-header { display: none; }
                .sidebar-overlay { 
                    display: none; 
                    position: fixed; 
                    top: 0; left: 0; right: 0; bottom: 0; 
                    background: rgba(0,0,0,0.6); 
                    z-index: 100; 
                    backdrop-filter: blur(4px);
                }

                @media (max-width: 1024px) {
                    .assistant-layout { 
                        grid-template-columns: 1fr; 
                        border-radius: 0;
                        height: calc(100vh - 80px); /* Adjust for mobile header */
                    }

                    .assistant-sidebar { 
                        position: fixed;
                        top: 0; left: 0; bottom: 0;
                        width: 280px;
                        z-index: 101;
                        background: #0a0a0f;
                        transform: translateX(-100%);
                        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 20px 0 50px rgba(0,0,0,0.5);
                    }

                    .assistant-sidebar.mobile-open {
                        transform: translateX(0);
                    }

                    .sidebar-mobile-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding-bottom: 2rem;
                        color: white;
                        font-weight: 800;
                        font-size: 0.8rem;
                        letter-spacing: 2px;
                    }

                    .sidebar-mobile-header button {
                        background: rgba(255,255,255,0.05);
                        border: none;
                        color: white;
                        width: 36px; height: 36px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .chat-header {
                        padding: 1rem 1.5rem;
                        gap: 1rem;
                    }

                    .mobile-menu-toggle {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(var(--primary-rgb), 0.1);
                        border: 1px solid rgba(var(--primary-rgb), 0.2);
                        color: var(--primary);
                        width: 40px; height: 40px;
                        border-radius: 12px;
                        cursor: pointer;
                    }

                    .desktop-only { display: none; }
                    .header-info h2 { font-size: 1.1rem; }
                    .header-info p { display: none; }
                    .status-badge { padding: 3px 8px; font-size: 0.55rem; }

                    .chat-container { padding: 1.5rem; }
                    .welcome-card { padding: 2.5rem 1.5rem; border-radius: 24px; }
                    .welcome-card h3 { font-size: 1.5rem; }
                    .welcome-card p { font-size: 0.9rem; }
                    .system-stats { flex-wrap: wrap; }
                    .message-wrapper { max-width: 90%; }
                    .message-bubble { padding: 1rem; font-size: 0.95rem; }

                    .input-area { padding: 1rem 1.5rem; }
                    .input-wrapper textarea { font-size: 1rem; padding: 0.5rem 1rem; }
                    .send-btn { width: 44px; height: 44px; }
                    
                    .sidebar-overlay { display: block; }
                }

                @media (max-width: 480px) {
                    .assistant-layout { height: calc(100vh - 60px); }
                    .welcome-icon-wrapper { width: 80px; height: 80px; margin-bottom: 1.5rem; }
                    .welcome-primary-icon { width: 32px; height: 32px; }
                    .icon-ring-outer { display: none; }
                }
            `}</style>
        </div>
    );
}
