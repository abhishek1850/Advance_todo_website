import { motion } from 'framer-motion';
import { useStore } from '../store';
import { format, parseISO } from 'date-fns';

export default function AchievementsView() {
    const { profile } = useStore();
    const unlocked = profile.badges.filter(b => b.unlockedAt);
    const locked = profile.badges.filter(b => !b.unlockedAt);
    const xpProgress = (profile.xp / profile.xpToNextLevel) * 100;
    const totalXP = (profile.level - 1) * 500 + profile.xp;

    const levelIcon = profile.level < 5 ? '🌱' : profile.level < 10 ? '⭐' : profile.level < 20 ? '🌟' : profile.level < 50 ? '💎' : '👑';
    const levelTitle = profile.level < 5 ? 'Beginner' : profile.level < 10 ? 'Rising Star' : profile.level < 20 ? 'Veteran' : profile.level < 50 ? 'Expert' : 'Legend';

    return (
        <div className="page-content">
            <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4, letterSpacing: '-0.5px' }}>Achievements</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 32 }}>Celebrate your progress and milestones</p>

            {/* Level Card */}
            <motion.div className="card" style={{ marginBottom: 32, textAlign: 'center', position: 'relative', overflow: 'hidden' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(124,108,240,0.1), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,212,207,0.05), transparent 50%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(124,108,240,0.3), transparent)' }} />

                <motion.div
                    style={{ fontSize: 72, marginBottom: 4 }}
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                >
                    {levelIcon}
                </motion.div>
                <div style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{levelTitle}</div>
                <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 2 }}>LEVEL</div>
                <div style={{ fontSize: 52, fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16, letterSpacing: -2 }}>
                    {profile.level}
                </div>
                <div style={{ maxWidth: 320, margin: '0 auto' }}>
                    <div className="xp-bar" style={{ width: '100%', height: 10 }}>
                        <motion.div className="xp-fill" initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{profile.xp} XP</span>
                        <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{profile.xpToNextLevel} XP</span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 28 }}>
                    {[
                        { value: profile.totalTasksCompleted, label: 'Tasks Done', color: 'var(--text-primary)' },
                        { value: profile.currentStreak, label: 'Day Streak', color: 'var(--accent-warning)' },
                        { value: profile.longestStreak, label: 'Best Streak', color: 'var(--text-primary)' },
                        { value: totalXP, label: 'Total XP', color: 'var(--accent-primary)' },
                    ].map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                            <div style={{ fontSize: 26, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Daily Challenge */}
            {profile.dailyChallenge && (
                <motion.div className="challenge-card" style={{ marginBottom: 32 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="challenge-label">⚡ Daily Challenge</div>
                    <div className="challenge-title">{profile.dailyChallenge.title}</div>
                    <div className="challenge-desc">{profile.dailyChallenge.description}</div>
                    <div className="challenge-progress">
                        <div className="challenge-bar">
                            <motion.div className="challenge-fill" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (profile.dailyChallenge.progress / profile.dailyChallenge.target) * 100)}%` }} transition={{ duration: 0.8 }} />
                        </div>
                        <span className="challenge-xp">
                            {profile.dailyChallenge.progress}/{profile.dailyChallenge.target} • +{profile.dailyChallenge.xpReward} XP
                            {profile.dailyChallenge.isCompleted && ' ✅'}
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Unlocked Badges */}
            {unlocked.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🏆</span> Unlocked
                        <span style={{ fontSize: 14, color: 'var(--accent-primary)', fontWeight: 600 }}>({unlocked.length})</span>
                    </h3>
                    <div className="badge-grid">
                        {unlocked.map((badge, i) => (
                            <motion.div
                                key={badge.id}
                                className="badge-card unlocked"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.06, y: -4 }}
                            >
                                <motion.div
                                    className="badge-icon"
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                                >
                                    {badge.icon}
                                </motion.div>
                                <div className="badge-name">{badge.name}</div>
                                <div className="badge-desc">{badge.description}</div>
                                {badge.unlockedAt && (
                                    <div className="badge-date">Unlocked {format(parseISO(badge.unlockedAt), 'MMM d, yyyy')}</div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Badges */}
            {locked.length > 0 && (
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🔒</span> Locked
                        <span style={{ fontSize: 14, fontWeight: 600 }}>({locked.length})</span>
                    </h3>
                    <div className="badge-grid">
                        {locked.map((badge, i) => (
                            <motion.div
                                key={badge.id}
                                className="badge-card locked"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="badge-icon">{badge.icon}</div>
                                <div className="badge-name">{badge.name}</div>
                                <div className="badge-desc">{badge.requirement}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
