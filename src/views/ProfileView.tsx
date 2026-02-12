import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Save, Loader2, Trophy, Flame, Target, TrendingUp, Award, Star, Edit2 } from 'lucide-react';
import { useStore } from '../store';
import { auth, db } from '../lib/firebase';
import { updateProfile, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const getRankTitle = (level: number) => {
    if (level >= 50) return 'Grandmaster';
    if (level >= 30) return 'Legend';
    if (level >= 20) return 'Master';
    if (level >= 10) return 'Expert';
    if (level >= 5) return 'Achiever';
    return 'Aspirant';
};

const motivationalQuotes = [
    "Every task completed is a step closer to your dreams.",
    "Consistency is the key to unlocking your potential.",
    "Small progress is still progress.",
    "You are capable of amazing things.",
    "Focus on being productive instead of busy.",
    "The future depends on what you do today."
];

export default function ProfileView() {
    const { user, setUser, profile, getProductivityScore } = useStore();
    const [name, setName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [quote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

    useEffect(() => {
        if (user) {
            setName(user.displayName || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setMessage('');

        try {
            if (user.displayName !== name) {
                await updateProfile(user, { displayName: name });
            }
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { 'profile.name': name });

            setUser({ ...user, displayName: name });
            useStore.setState(state => ({
                ...state,
                profile: { ...state.profile, name: name }
            }));

            setMessage('Profile updated successfully!');
            setTimeout(() => {
                setMessage('');
                setIsEditing(false);
            }, 1000);
        } catch (error: any) {
            console.error(error);
            setMessage(`Failed to update: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    if (!user) return null;

    const rankTitle = getRankTitle(profile.level);
    const xpProgress = Math.min(100, (profile.xp / profile.xpToNextLevel) * 100);
    const productivityScore = getProductivityScore();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="view-container" style={{ paddingBottom: 80 }}>
            {/* Header / Intro */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="profile-header"
                style={{ marginBottom: 32, textAlign: 'center' }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ marginBottom: 12 }}
                >
                    <span style={{
                        fontSize: 12, fontWeight: 700, letterSpacing: 2,
                        textTransform: 'uppercase', color: 'var(--accent-primary)',
                        background: 'rgba(124, 108, 240, 0.1)', padding: '6px 16px', borderRadius: 20
                    }}>
                        Your Journey
                    </span>
                </motion.div>
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
                    Hello, <span style={{
                        background: 'var(--gradient-primary)',
                        backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>{name || 'Traveler'}</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 500, margin: '0 auto', fontStyle: 'italic' }}>
                    "{quote}"
                </p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}
            >
                {/* Hero / Level Card */}
                <motion.div
                    variants={itemVariants}
                    className="card"
                    style={{
                        padding: 0, overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(8,8,16,0.8), rgba(20,20,35,0.9))',
                        border: '1px solid var(--border-medium)'
                    }}
                >
                    <div className="profile-hero-content" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {/* Avatar Section */}
                        <div style={{
                            padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.02)', borderRight: '1px solid var(--border-subtle)',
                            position: 'relative', minWidth: 260, flex: '1 1 260px'
                        }}>
                            <div style={{ position: 'relative' }}>

                                <div style={{
                                    width: 100, height: 100, borderRadius: '50%',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 40, fontWeight: 'bold', color: 'white',
                                    position: 'relative', zIndex: 1,
                                    border: '4px solid rgba(255,255,255,0.1)',
                                    overflow: 'hidden'
                                }}>
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (name?.[0] || 'U').toUpperCase()
                                    )}
                                </div>

                            </div>

                            <div style={{ marginTop: 16, textAlign: 'center' }}>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>{name}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{user.email}</div>
                            </div>

                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                style={{
                                    marginTop: 20, display: 'flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
                                    padding: '8px 16px', borderRadius: 20, fontSize: 12, color: 'var(--text-secondary)',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <Edit2 size={12} /> Edit Profile
                            </button>
                        </div>

                        {/* Level Info Section */}
                        <div style={{ flex: '1 1 300px', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                <div>
                                    <h3 style={{ fontSize: 14, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>Current Rank</h3>
                                    <div style={{ fontSize: 36, fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {rankTitle}
                                        <span style={{
                                            fontSize: 14, background: 'var(--accent-warning)', color: 'black',
                                            padding: '2px 8px', borderRadius: 4, fontWeight: 800
                                        }}>
                                            LVL {profile.level}
                                        </span>
                                    </div>
                                </div>
                                <Trophy size={48} color="var(--accent-warning)" style={{ opacity: 0.8 }} />
                            </div>

                            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                                <span style={{ color: 'var(--accent-primary)' }}>{profile.xp} XP</span>
                                <span style={{ color: 'var(--text-tertiary)' }}>{profile.xpToNextLevel} XP to Level {profile.level + 1}</span>
                            </div>
                            <div style={{
                                height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden',
                                border: '1px solid var(--border-subtle)', position: 'relative'
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${xpProgress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    style={{
                                        height: '100%', background: 'var(--gradient-primary)', borderRadius: 6,
                                        boxShadow: '0 0 10px var(--accent-primary-glow)'
                                    }}
                                />
                            </div>
                            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Keep completing tasks to earn XP and unlock new ranks. You are doing great!
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Edit Form (Collapsible) */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="card" style={{ padding: 24, border: '1px solid var(--accent-primary)', background: 'rgba(124, 108, 240, 0.05)' }}>
                                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: 12, marginBottom: 6, color: 'var(--text-secondary)' }}>Display Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="form-input"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save
                                        </button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                                {message && <div style={{ marginTop: 12, fontSize: 13, color: message.includes('Failed') ? 'var(--accent-danger)' : 'var(--accent-success)' }}>{message}</div>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <motion.div variants={itemVariants} className="stat-card purple">
                        <div className="stat-card-icon"><Target /></div>
                        <div className="stat-card-value">{profile.totalTasksCompleted}</div>
                        <div className="stat-card-label">Total Tasks Completed</div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="stat-card orange">
                        <div className="stat-card-icon"><Flame /></div>
                        <div className="stat-card-value">{profile.currentStreak}</div>
                        <div className="stat-card-label">Day Streak</div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="stat-card teal">
                        <div className="stat-card-icon"><TrendingUp /></div>
                        <div className="stat-card-value">{productivityScore}%</div>
                        <div className="stat-card-label">Productivity Score</div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="stat-card pink">
                        <div className="stat-card-icon"><Award /></div>
                        <div className="stat-card-value">{profile.badges.filter(b => b.unlockedAt).length}</div>
                        <div className="stat-card-label">Badges Earned</div>
                    </motion.div>
                </div>

                {/* Recent Badges Preview */}
                <motion.div variants={itemVariants} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Star size={18} color="var(--accent-warning)" /> Recent Achievements
                        </h3>
                    </div>
                    <div className="badge-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                        {profile.badges.filter(b => b.unlockedAt).slice(-4).map(badge => (
                            <div key={badge.id} className="badge-card unlocked" style={{ padding: 16 }}>
                                <div className="badge-icon" style={{ fontSize: 32 }}>{badge.icon}</div>
                                <div className="badge-name" style={{ fontSize: 12 }}>{badge.name}</div>
                            </div>
                        ))}
                        {profile.badges.filter(b => b.unlockedAt).length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-tertiary)', padding: 20 }}>
                                No badges earned yet. Start completing tasks!
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Logout Area */}
                <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    {showLogoutConfirm ? (
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-card)', padding: 8, borderRadius: 12, border: '1px solid var(--border-medium)' }}>
                            <span style={{ fontSize: 14, padding: '0 8px' }}>Are you sure?</span>
                            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '6px 16px' }}>Yes, Logout</button>
                            <button onClick={() => setShowLogoutConfirm(false)} className="btn btn-secondary" style={{ padding: '6px 16px' }}>Cancel</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="btn"
                            style={{
                                color: 'var(--text-tertiary)', background: 'transparent',
                                display: 'flex', alignItems: 'center', gap: 8
                            }}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
