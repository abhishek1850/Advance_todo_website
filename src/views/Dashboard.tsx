import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { useStore } from '../store';
import TaskCard from '../components/TaskCard';
import ProgressRing from '../components/ProgressRing';
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
    const { profile, getTodaysTasks, getCompletionRate, getWeeklyCompletionData, getTodaysFocus, openTaskModal, getProductivityScore } = useStore();
    const todayTasks = getTodaysTasks();
    const todayCompleted = todayTasks.filter(t => t.isCompleted).length;
    const todayTotal = todayTasks.length;
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
        <div className="page-content">
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
                    <div className="focus-card-action">
                        <button className="btn btn-primary" onClick={() => useStore.getState().toggleTask(focus.id)}>
                            <CheckCircle2 size={16} style={{ marginRight: 8 }} /> Complete Now
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
                    <div className="focus-card-label"><Sparkles size={14} /> Welcome to TaskFlow</div>
                    <div className="focus-card-title">Your productivity journey starts here</div>
                    <div className="focus-card-desc">Add your first task and unlock achievements, earn XP, and build powerful habits.</div>
                    <div className="focus-card-action">
                        <button className="btn btn-primary" onClick={() => openTaskModal()}>
                            <Zap size={16} style={{ marginRight: 8 }} /> Add Your First Task
                        </button>
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
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
                <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
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
                            <Tooltip contentStyle={{ background: 'rgba(14,14,26,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0f0f8', backdropFilter: 'blur(12px)' }} />
                            <Area type="monotone" dataKey="completed" stroke="#7c6cf0" fill="url(#colorCompleted)" strokeWidth={2.5} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
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
                <motion.div className="challenge-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} style={{ marginBottom: 32 }}>
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
            {todayTasks.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
                    <div className="task-list-header">
                        <h3 className="task-list-title">Today's Tasks</h3>
                        <span className="task-list-count">{todayCompleted}/{todayTotal} done</span>
                    </div>
                    <div className="task-list">
                        {todayTasks.slice(0, 5).map((task, i) => (
                            <TaskCard key={task.id} task={task} index={i} />
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
