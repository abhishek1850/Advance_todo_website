import { motion } from 'framer-motion';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Brain } from 'lucide-react';

export default function AnalyticsView() {
    const { tasks, profile, getWeeklyCompletionData, getCategoryStats, getProductivityScore } = useStore();

    const weekData = getWeeklyCompletionData();
    const catStats = getCategoryStats();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const avgCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const prodScore = getProductivityScore();

    // Horizon breakdown
    const horizonData = [
        { name: 'Daily', value: tasks.filter(t => t.horizon === 'daily').length, color: '#7c6cf0' },
        { name: 'Monthly', value: tasks.filter(t => t.horizon === 'monthly').length, color: '#00d4cf' },
        { name: 'Yearly', value: tasks.filter(t => t.horizon === 'yearly').length, color: '#f97fbe' },
    ].filter(d => d.value > 0);

    // Priority breakdown
    const priorityData = [
        { name: 'Critical', value: tasks.filter(t => t.priority === 'critical').length, color: '#ff6b6b' },
        { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#ffc857' },
        { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#00d4cf' },
        { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#00d68f' },
    ].filter(d => d.value > 0);

    // Category radar data
    const radarData = catStats.map(c => ({
        subject: c.category,
        completed: c.completed,
        total: c.total,
        rate: c.total ? Math.round((c.completed / c.total) * 100) : 0,
    }));

    // AI Insights
    const insights: { icon: string; text: string; color: string }[] = [];
    const bestDay = weekData.reduce((best, d) => d.completed > best.completed ? d : best, weekData[0]);
    if (bestDay && bestDay.completed > 0) {
        insights.push({ icon: '📊', text: `You're most productive on <strong>${bestDay.day}s</strong> with ${bestDay.completed} tasks completed.`, color: 'var(--accent-primary)' });
    }
    if (profile.currentStreak > 3) {
        insights.push({ icon: '🔥', text: `You're on a <strong>${profile.currentStreak}-day streak</strong>! Keep going to hit ${profile.currentStreak < 7 ? 7 : profile.currentStreak < 30 ? 30 : 100} days.`, color: 'var(--accent-warning)' });
    }
    if (avgCompletionRate > 70) {
        insights.push({ icon: '⭐', text: `Your <strong>${avgCompletionRate}% completion rate</strong> is excellent! You're in the top tier of productivity.`, color: 'var(--accent-success)' });
    } else if (avgCompletionRate > 0) {
        insights.push({ icon: '💡', text: `Your completion rate is <strong>${avgCompletionRate}%</strong>. Try breaking large tasks into smaller ones for better follow-through.`, color: 'var(--accent-secondary)' });
    }
    const highPriorityDone = tasks.filter(t => (t.priority === 'high' || t.priority === 'critical') && t.isCompleted).length;
    const highPriorityTotal = tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length;
    if (highPriorityTotal > 0) {
        insights.push({ icon: '🎯', text: `You've completed <strong>${highPriorityDone}/${highPriorityTotal}</strong> high-priority tasks. ${highPriorityDone === highPriorityTotal ? 'Perfect focus!' : 'Prioritize what matters most.'}`, color: 'var(--accent-tertiary)' });
    }
    if (prodScore >= 80) {
        insights.push({ icon: '🚀', text: `Your productivity score is <strong>${prodScore}%</strong>. Outstanding performance! Keep this momentum going.`, color: 'var(--accent-success)' });
    }

    const tooltipStyle = { background: 'rgba(14,14,26,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0f0f8' };

    return (
        <div className="page-content">
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4, letterSpacing: '-0.5px' }}>Analytics</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 32 }}>Understand your productivity patterns</p>

            {/* Stats Row */}
            <div className="dashboard-grid" style={{ marginBottom: 32 }}>
                {[
                    { label: 'Total Tasks', value: totalTasks, icon: '📋', color: 'purple' },
                    { label: 'Completed', value: completedTasks, icon: '✅', color: 'teal' },
                    { label: 'Completion Rate', value: `${avgCompletionRate}%`, icon: '📊', color: 'pink' },
                    { label: 'Productivity', value: `${prodScore}%`, icon: '⚡', color: 'orange' },
                ].map((s, i) => (
                    <motion.div key={s.label} className={`stat-card ${s.color}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }}>
                        <div className="stat-card-icon">{s.icon}</div>
                        <div className="stat-card-value">{s.value}</div>
                        <div className="stat-card-label">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="analytics-grid">
                {/* Weekly Activity */}
                <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="chart-title">Weekly Activity</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weekData}>
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#7c6cf0" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#7c6cf0" stopOpacity={0.4} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#5e5e80', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5e5e80', fontSize: 12 }} />
                            <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f0f0f8' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Bar dataKey="completed" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Task Distribution */}
                <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="chart-title">Task Horizons</div>
                    {horizonData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={horizonData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
                                    {horizonData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f0f0f8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: 8 }}>
                            <span style={{ fontSize: 32 }}>📊</span>
                            <span>No tasks yet</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                        {horizonData.map(d => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, boxShadow: `0 0 8px ${d.color}40` }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{d.name}: {d.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Category Performance */}
                {radarData.length > 0 && (
                    <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <div className="chart-title">Category Performance</div>
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.04)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9898b8', fontSize: 11 }} />
                                <PolarRadiusAxis tick={false} axisLine={false} />
                                <Radar name="Completed" dataKey="completed" stroke="#7c6cf0" fill="#7c6cf0" fillOpacity={0.25} strokeWidth={2} />
                                <Radar name="Total" dataKey="total" stroke="#00d4cf" fill="#00d4cf" fillOpacity={0.08} strokeWidth={1.5} />
                                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f0f0f8' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Priority Breakdown */}
                {priorityData.length > 0 && (
                    <motion.div className="chart-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        <div className="chart-title">Priority Breakdown</div>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={priorityData} layout="vertical">
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#5e5e80', fontSize: 12 }} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9898b8', fontSize: 12 }} width={70} />
                                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f0f0f8' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                    {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* AI Insights */}
                {insights.length > 0 && (
                    <motion.div className="analytics-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Brain size={20} style={{ color: 'var(--accent-primary)' }} />
                            AI Insights
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                            {insights.map((insight, i) => (
                                <motion.div
                                    key={i} className="insight-card"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + i * 0.08 }}
                                    whileHover={{ y: -2 }}
                                >
                                    <div className="insight-icon">{insight.icon}</div>
                                    <div className="insight-text" dangerouslySetInnerHTML={{ __html: insight.text }} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {tasks.length === 0 && (
                <motion.div className="empty-state" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <motion.div className="empty-state-icon" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>📊</motion.div>
                    <div className="empty-state-title">No data yet</div>
                    <div className="empty-state-text">Complete some tasks to see your productivity analytics and AI-powered insights.</div>
                </motion.div>
            )}
        </div>
    );
}
