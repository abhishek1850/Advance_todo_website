import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Zap, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';
import TaskCard from '../components/TaskCard';
import { playSound } from '../lib/sounds';
import ProgressRing from '../components/ProgressRing';
import { DailyMotivation, StreakMilestone, ProductivityTip, getSmartGreeting } from '../components/MotivationEngine';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Animated counter hook
function useAnimatedCounter(target: number, duration = 1200) {
    const [count, setCount] = useState(0);
    const prevTarget = useRef(0);
    useEffect(() => {
        const start = prevTarget.current;
        prevTarget.current = target;
        if (start === target) { setCount(target); return; }
        const startTime = Date.now();
        const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(start + (target - start) * eased));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [target, duration]);
    return count;
}

export default function Dashboard() {
    const { profile, getTodaysTasks, getCompletionRate, getWeeklyCompletionData, getTodaysFocus, openTaskModal, getProductivityScore, setView, setPendingAssistantMessage, getStagnantTasks } = useStore();
    const todayTasks = getTodaysTasks();
    const stagnantTasks = getStagnantTasks();
    const mostStagnant = stagnantTasks.length > 0 ? stagnantTasks.sort((a, b) => (b.daysPending || 0) - (a.daysPending || 0))[0] : null;

    const todayCompleted = todayTasks.filter(t => t.isCompleted).length;
    const todayTotal = todayTasks.length;
    const pendingTasks = todayTasks.filter(t => t.isRolledOver && !t.isCompleted);
    const regularTasks = todayTasks.filter(t => !pendingTasks.includes(t));
    const focus = getTodaysFocus();
    const weekData = getWeeklyCompletionData();
    const dailyRate = getCompletionRate('daily');
    const prodScore = getProductivityScore();

    const animatedCompleted = useAnimatedCounter(profile.totalTasksCompleted);
    const animatedStreak = useAnimatedCounter(profile.currentStreak);
    const animatedLevel = useAnimatedCounter(profile.level);



    const getScoreClass = (score: number) => {
        if (score >= 80) return 'great';
        if (score >= 60) return 'good';
        if (score >= 40) return 'okay';
        return 'low';
    };

    const stats = [
        { label: 'Tasks Today', value: `${todayCompleted}/${todayTotal}`, icon: '📋', color: 'purple' },
        { label: 'Current Streak', value: `${animatedStreak} days`, icon: '🔥', color: 'orange' },
        { label: 'Level', value: animatedLevel, icon: '⭐', color: 'teal' },
        { label: 'Total Completed', value: animatedCompleted, icon: '🏆', color: 'pink' },
    ];

    return (
        <div className="page-content" style={{ position: 'relative' }}>
            {/* Header / Greeting Section */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #fff, #a5a5a5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {(() => {
                            const greeting = getSmartGreeting(profile.name || 'Attacker');
                            const firstSpace = greeting.indexOf(' ');
                            if (firstSpace === -1) return greeting;
                            const emoji = greeting.slice(0, firstSpace);
                            const text = greeting.slice(firstSpace + 1);
                            return (
                                <>
                                    <span style={{ WebkitTextFillColor: 'initial', marginRight: 12 }}>{emoji}</span>
                                    {text}
                                </>
                            );
                        })()}
                    </h1>
                    <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 4 }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Motivational Widgets */}
            <DailyMotivation />
            <StreakMilestone />

            {/* Focus Card */}
            {focus ? (
                <motion.div className="focus-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="focus-card-label"><Sparkles size={14} /> Today's Focus</div>
                    <div className="focus-card-title">{focus.title}</div>
                    {focus.description && <div className="focus-card-desc">{focus.description}</div>}
                    <div className="focus-card-meta">
                        <span className="task-tag horizon">{focus.horizon}</span>
                        <span className={`task-tag energy-${focus.energyLevel}`}>{focus.energyLevel === 'low' ? '🔋' : focus.energyLevel === 'medium' ? '⚡' : '🔥'} {focus.energyLevel}</span>
                        <span className="task-tag xp">+{focus.xpValue} XP</span>
                    </div>
                    <div className="focus-card-action" style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-primary" onClick={() => useStore.getState().toggleTask(focus.id)}>
                            <CheckCircle2 size={16} style={{ marginRight: 8 }} /> Complete Now
                        </button>
                        <button className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => { playSound('success'); setPendingAssistantMessage("Review my tasks and suggests a plan for today."); setView("assistant"); }}>
                            <Sparkles size={16} /> Plan My Day
                        </button>
                    </div>
                </motion.div>
            ) : todayTotal > 0 ? (
                <motion.div className="focus-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="focus-card-label"><Sparkles size={14} /> All Done!</div>
                    <div className="focus-card-title">🎉 You've completed all tasks for today!</div>
                    <div className="focus-card-desc">Great work! Take a well-deserved break or plan ahead for tomorrow.</div>

                </motion.div>
            ) : (
                <motion.div className="focus-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="focus-card-label"><Sparkles size={14} /> Welcome to Attackers Arena</div>
                    <div className="focus-card-title">Your mission begins now</div>
                    <div className="focus-card-desc">Add your first mission and unlock achievements, earn XP, and build unstoppable discipline.</div>
                    <div className="focus-card-action" style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-primary" onClick={() => openTaskModal()}>
                            <Zap size={16} style={{ marginRight: 8 }} /> Add Your First Task
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Coach Insight: Procrastination Alert */}
            {mostStagnant && (
                <motion.div
                    className="insight-alert"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24, padding: 16, background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.3)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ padding: 8, background: 'rgba(255, 107, 107, 0.2)', borderRadius: 12, color: 'var(--accent-danger)' }}>
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--accent-danger)', fontSize: 13, marginBottom: 2 }}>COACH INSIGHT</div>
                            <div style={{ fontSize: 14 }}>"{mostStagnant.title}" has been stuck for <span style={{ fontWeight: 700 }}>{mostStagnant.daysPending} days</span>.</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 14px', borderRadius: 8, fontSize: 13, border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => { playSound('click'); setPendingAssistantMessage(`Help me break down the task "${mostStagnant.title}" into smaller steps.`); setView('assistant'); }}>
                            Break It Down
                        </button>
                        <button className="btn-sm" style={{ background: 'transparent', color: 'var(--text-tertiary)', padding: '8px 14px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border-subtle)', cursor: 'pointer' }} onClick={() => { playSound('click'); openTaskModal(mostStagnant); }}>
                            Reschedule
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Pending Tasks Section */}
            {pendingTasks.length > 0 && (
                <motion.div
                    className="pending-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 24, padding: 16, background: 'rgba(255, 171, 0, 0.1)', border: '1px solid rgba(255, 171, 0, 0.3)', borderRadius: 16 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#ffab00', fontWeight: 600 }}>
                        <Zap size={18} /> Yesterday's Pending ({pendingTasks.length})
                    </div>
                    <div className="task-list">
                        {pendingTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="dashboard-grid">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className={`stat-card ${stat.color}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -3 }}
                    >
                        <div className="stat-card-icon">{stat.icon}</div>
                        <div className="stat-card-value">{stat.value}</div>
                        <div className="stat-card-label">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="charts-grid">
                <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="chart-title">Weekly Activity</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={weekData}>
                            <defs>
                                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7c6cf0" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#7c6cf0" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#5e5e80', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5e5e80', fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: 'rgba(14,14,26,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0f0f8', backdropFilter: 'blur(12px)' }} itemStyle={{ color: '#f0f0f8' }} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                            <Area type="monotone" dataKey="completed" stroke="#7c6cf0" fill="url(#colorCompleted)" strokeWidth={2.5} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
                    <div className="chart-title">Daily Progress</div>
                    <ProgressRing progress={dailyRate} size={120} label="Complete" />
                    <div className="productivity-score">
                        <Zap size={16} style={{ color: 'var(--accent-warning)' }} />
                        <div>
                            <div className="productivity-label">Productivity</div>
                            <div className={`productivity-value ${getScoreClass(prodScore)}`}>{prodScore}%</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Daily Challenge */}
            {profile.dailyChallenge && (
                <motion.div className="challenge-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
                    <div className="challenge-label">⚡ Daily Challenge</div>
                    <div className="challenge-title">{profile.dailyChallenge.title}</div>
                    <div className="challenge-desc">{profile.dailyChallenge.description}</div>
                    <div className="challenge-progress">
                        <div className="challenge-bar">
                            <motion.div
                                className="challenge-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (profile.dailyChallenge.progress / profile.dailyChallenge.target) * 100)}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                        <span className="challenge-xp">
                            {profile.dailyChallenge.progress}/{profile.dailyChallenge.target} • +{profile.dailyChallenge.xpReward} XP
                            {profile.dailyChallenge.isCompleted && ' ✅'}
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Recent Tasks */}
            {regularTasks.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="task-list-header">
                        <h3 className="task-list-title">Today's Tasks</h3>
                        <span className="task-list-count">{todayCompleted}/{todayTotal} done</span>
                    </div>
                    <div className="task-list">
                        {regularTasks.slice(0, 5).map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Productivity Tip */}
            <ProductivityTip />
        </div>
    );
}
