import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Save, Loader2, Trophy, Flame, Target, TrendingUp, Award, Star, Edit2, Sparkles, Camera, X } from 'lucide-react';
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
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [quote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

    useEffect(() => {
        if (user) {
            setName(user.displayName || '');
            setPhotoURL(user.photoURL || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setMessage('');

        try {
            // Update Auth Profile
            if (user.displayName !== name || user.photoURL !== photoURL) {
                await updateProfile(user, {
                    displayName: name,
                    photoURL: photoURL || null
                });
            }

            // Update Firestore
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                'profile.name': name,
                photoURL: photoURL || null
            });

            // Update Local Store
            const updatedUser = { ...user, displayName: name, photoURL: photoURL };
            setUser(updatedUser);
            useStore.setState(state => ({
                ...state,
                profile: { ...state.profile, name: name }
            }));

            setMessage('Profile updated successfully!');
            setTimeout(() => {
                setMessage('');
                setIsEditing(false);
            }, 1500);
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
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="view-container" style={{ paddingBottom: 100 }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="profile-header"
                style={{ marginBottom: 40, textAlign: 'center' }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ marginBottom: 16 }}
                >
                    <span style={{
                        fontSize: 12, fontWeight: 700, letterSpacing: 2,
                        textTransform: 'uppercase', color: 'var(--accent-primary)',
                        background: 'rgba(124, 108, 240, 0.1)', padding: '6px 16px', borderRadius: 20
                    }}>
                        Your Profile
                    </span>
                </motion.div>
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
                    Welcome back, <span style={{
                        background: 'var(--gradient-primary)',
                        backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>{name.split(' ')[0] || 'Warrior'}</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 500, margin: '0 auto', fontStyle: 'italic', opacity: 0.8 }}>
                    "{quote}"
                </p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}
            >
                {/* Main Profile Card */}
                <motion.div
                    variants={itemVariants}
                    className="card"
                    style={{
                        padding: 0, overflow: 'hidden',
                        background: 'rgba(12, 12, 20, 0.6)',
                        border: '1px solid var(--border-medium)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Cover / Mesh Background */}
                    <div style={{
                        height: 120,
                        background: 'linear-gradient(90deg, rgba(124,108,240,0.2) 0%, rgba(255,107,107,0.1) 100%)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div className="mesh-background" style={{ opacity: 0.4 }} />
                    </div>

                    <div style={{ padding: '0 32px 32px', marginTop: -60, position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {/* Avatar */}
                            <div style={{ position: 'relative', marginBottom: 24 }}>
                                <motion.div
                                    animate={isEditing ? { scale: 1.05 } : { scale: 1 }}
                                    style={{
                                        width: 120, height: 120, borderRadius: '50%',
                                        background: 'var(--bg-secondary)',
                                        border: '4px solid var(--bg-card)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 48, fontWeight: 'bold', color: 'white',
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                        position: 'relative'
                                    }}
                                >
                                    {photoURL ? (
                                        <img src={photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (name?.[0] || 'U').toUpperCase()
                                    )}

                                    {/* Level Badge on Avatar */}
                                    <div style={{
                                        position: 'absolute', bottom: 0, right: 0,
                                        width: '100%', height: '100%',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)',
                                        pointerEvents: 'none'
                                    }} />
                                </motion.div>

                                <div style={{
                                    position: 'absolute', bottom: 5, right: 5,
                                    background: 'var(--gradient-primary)', borderRadius: '50%', padding: 6,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                    border: '2px solid var(--bg-card)',
                                    zIndex: 2
                                }}>
                                    <Sparkles size={16} color="white" fill="white" />
                                </div>
                            </div>

                            {/* Name & Actions */}
                            {isEditing ? (
                                <motion.form
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onSubmit={handleUpdateProfile}
                                    style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}
                                >
                                    <div className="form-group" style={{ width: '100%' }}>
                                        <label style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6, display: 'block' }}>Display Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="form-input"
                                            placeholder="Enter your name"
                                            style={{ textAlign: 'center', fontSize: 18, fontWeight: 600 }}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="form-group" style={{ width: '100%' }}>
                                        <label style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6, display: 'block' }}>Avatar URL (Optional)</label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input
                                                type="url"
                                                value={photoURL}
                                                onChange={(e) => setPhotoURL(e.target.value)}
                                                className="form-input"
                                                placeholder="https://example.com/avatar.jpg"
                                                style={{ flex: 1 }}
                                            />
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 8,
                                                background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: '1px solid var(--border-subtle)', overflow: 'hidden'
                                            }}>
                                                {photoURL ? <img src={photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={16} color="var(--text-tertiary)" />}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                        <button type="submit" className="btn" style={{ background: 'var(--accent-success)', color: 'white', padding: '10px 24px', borderRadius: 20 }} disabled={loading}>
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                                        </button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '10px 20px', borderRadius: 20 }}>
                                            <X size={16} /> Cancel
                                        </button>
                                    </div>
                                </motion.form>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{name}</h2>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 20 }}>{user.email}</p>

                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border-subtle)',
                                            padding: '8px 20px', borderRadius: 20,
                                            fontSize: 13, color: 'var(--text-secondary)',
                                            display: 'inline-flex', alignItems: 'center', gap: 8,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Edit2 size={14} /> Edit Profile
                                    </button>
                                </div>
                            )}

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ marginTop: 16, fontSize: 13, color: message.includes('Failed') ? 'var(--accent-danger)' : 'var(--accent-success)' }}
                                >
                                    {message}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                        divideX: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{ padding: 24, textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>{profile.level}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Level</div>
                        </div>
                        <div style={{ padding: 24, textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-primary)' }}>{profile.xp}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Total XP</div>
                        </div>
                        <div style={{ padding: 24, textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-warning)' }}>{rankTitle}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Rank</div>
                        </div>
                    </div>
                </motion.div>

                {/* Progress Card */}
                <motion.div variants={itemVariants} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 className="card-title" style={{ marginBottom: 0 }}>Level Progress</h3>
                        <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{profile.xp} / {profile.xpToNextLevel} XP</span>
                    </div>
                    <div style={{
                        height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 6,
                        border: '1px solid var(--border-subtle)', overflow: 'hidden'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            style={{
                                height: '100%', background: 'var(--gradient-primary)',
                                borderRadius: 6, boxShadow: '0 0 12px var(--accent-primary-glow)'
                            }}
                        />
                    </div>
                    <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Trophy size={14} color="var(--accent-warning)" />
                        <span>Keep going! You're {Math.round(100 - xpProgress)}% away from the next level.</span>
                    </div>
                </motion.div>

                {/* Badges Grid */}
                <motion.div variants={itemVariants} className="card">
                    <h3 className="card-title">Earned Badges</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 16, marginTop: 16 }}>
                        {profile.badges.filter(b => b.unlockedAt).map(badge => (
                            <motion.div
                                key={badge.id}
                                whileHover={{ scale: 1.05, y: -5 }}
                                style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
                                    borderRadius: 12, padding: 16, textAlign: 'center', cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontSize: 32, marginBottom: 8 }}>{badge.icon}</div>
                                <div style={{ fontSize: 11, fontWeight: 600 }}>{badge.name}</div>
                            </motion.div>
                        ))}
                        {profile.badges.filter(b => b.unlockedAt).length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 24, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                                No badges yet. Complete tasks to earn them!
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Logout Zone */}
                <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
                    {showLogoutConfirm ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            style={{
                                background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.2)',
                                padding: '16px 24px', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                            }}
                        >
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-danger)' }}>Are you sure you want to log out?</span>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={handleLogout} className="btn" style={{ background: 'var(--accent-danger)', color: 'white', padding: '8px 20px', borderRadius: 12 }}>Yes, Logout</button>
                                <button onClick={() => setShowLogoutConfirm(false)} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 20px', borderRadius: 12 }}>Cancel</button>
                            </div>
                        </motion.div>
                    ) : (
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="btn"
                            style={{
                                color: 'var(--text-tertiary)', background: 'transparent',
                                display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500,
                                opacity: 0.7, transition: 'opacity 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
