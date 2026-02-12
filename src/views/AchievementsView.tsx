import { useStore } from '../store';
import { motion } from 'framer-motion';
import { Trophy, Lock, Medal } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

export default function AchievementsView() {
    const { profile } = useStore();
    const { badges, level, xp, xpToNextLevel } = profile;
    const progress = Math.min(100, (xp / xpToNextLevel) * 100);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="page-content" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 80 }}>
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'center',
                    gap: isMobile ? 16 : 24,
                    marginBottom: 40,
                    background: 'linear-gradient(135deg, rgba(124, 108, 240, 0.1) 0%, rgba(124, 108, 240, 0.02) 100%)',
                    padding: isMobile ? 20 : 32,
                    borderRadius: 24,
                    border: '1px solid rgba(124, 108, 240, 0.2)',
                    textAlign: isMobile ? 'center' : 'left'
                }}
            >
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: isMobile ? 80 : 100, height: isMobile ? 80 : 100,
                        borderRadius: '50%',
                        background: 'var(--accent-primary)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', color: 'white',
                        boxShadow: '0 0 30px rgba(124, 108, 240, 0.4)'
                    }}>
                        <span style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, lineHeight: 1 }}>{level}</span>
                        <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 600, opacity: 0.9 }}>LEVEL</span>
                    </div>
                </div>

                <div style={{ flex: 1, width: '100%' }}>
                    <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 24, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: 12 }}>
                        <Trophy className="text-accent" size={isMobile ? 20 : 24} /> Achievement Hall
                    </h1>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                        <span>Current XP: {xp}</span>
                        <span>Next Level: {xpToNextLevel}</span>
                    </div>
                    <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), #a78bfa)', borderRadius: 5 }}
                        />
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
                        Earn XP by completing tasks and maintaining streaks to unlock new features.
                    </div>
                </div>
            </motion.div>

            {/* Badges Grid */}
            <h2 style={{ fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Medal size={20} style={{ color: 'gold' }} />
                Badges ({badges.filter(b => b.unlockedAt).length}/{badges.length})
            </h2>

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16
            }}>
                {badges.map((badge, i) => (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                            background: badge.unlockedAt ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)',
                            border: `1px solid ${badge.unlockedAt ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)'}`,
                            borderRadius: 16,
                            padding: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative',
                            opacity: badge.unlockedAt ? 1 : 0.5,
                            filter: badge.unlockedAt ? 'none' : 'grayscale(100%)'
                        }}
                        whileHover={{ y: badge.unlockedAt ? -4 : 0, borderColor: badge.unlockedAt ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)' }}
                    >
                        <div style={{
                            fontSize: 32, marginBottom: 12,
                            filter: badge.unlockedAt ? 'drop-shadow(0 0 10px rgba(255,215,0,0.3))' : 'none'
                        }}>
                            {badge.icon}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{badge.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.3 }}>
                            {badge.description}
                        </div>

                        {badge.unlockedAt ? (
                            <div style={{
                                marginTop: 'auto', fontSize: 11, color: 'var(--accent-success)',
                                padding: '4px 8px', background: 'rgba(0, 200, 83, 0.1)',
                                borderRadius: 12, fontWeight: 500
                            }}>
                                Unlocked {format(new Date(badge.unlockedAt), 'MMM d')}
                            </div>
                        ) : (
                            <div style={{
                                marginTop: 'auto', fontSize: 11, color: 'var(--text-tertiary)',
                                display: 'flex', alignItems: 'center', gap: 4
                            }}>
                                <Lock size={10} /> {badge.requirement}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
