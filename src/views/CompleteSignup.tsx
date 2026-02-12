import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, AtSign, CheckCircle, ArrowRight, Loader2, Shield } from 'lucide-react';
import { useStore } from '../store';

export default function CompleteSignup() {
    const { completeOnboarding, user } = useStore();
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            setError('You must agree to the terms and conditions.');
            return;
        }
        if (username.length < 3) {
            setError('Username must be at least 3 characters.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await completeOnboarding({ username, name: displayName });
        } catch (err: any) {
            console.error(err);
            setError('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--gradient-bg)',
            position: 'relative',
            overflow: 'hidden',
            padding: 20
        }}>
            <div className="mesh-background" style={{ opacity: 0.4 }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: '100%',
                    maxWidth: 480,
                    zIndex: 10,
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            width: 64, height: 64,
                            margin: '0 auto 16px',
                            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4A3DB8 100%)',
                            borderRadius: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(108, 92, 231, 0.3)',
                        }}
                    >
                        <User size={32} color="white" />
                    </motion.div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 8, letterSpacing: '-1px' }}>
                        Finish Your Profile
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
                        One last step to Join the Arena
                    </p>
                </div>

                <div style={{
                    background: 'rgba(12, 12, 20, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 32,
                    padding: '40px',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Display Name */}
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                Display Name
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', top: 14, left: 16, color: 'var(--text-tertiary)' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Alex Rivera"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    required
                                    style={{ paddingLeft: 48, width: '100%', height: 48, borderRadius: 12 }}
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                Unique Username
                            </label>
                            <div style={{ position: 'relative' }}>
                                <AtSign size={18} style={{ position: 'absolute', top: 14, left: 16, color: 'var(--text-tertiary)' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="alex_warrior"
                                    value={username}
                                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    required
                                    style={{ paddingLeft: 48, width: '100%', height: 48, borderRadius: 12 }}
                                />
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6, marginLeft: 4 }}>
                                Only letters, numbers, and underscores allowed.
                            </p>
                        </div>

                        {/* Agreement */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 8 }}>
                            <div
                                onClick={() => setAgreed(!agreed)}
                                style={{
                                    flexShrink: 0,
                                    width: 22, height: 22,
                                    borderRadius: 6,
                                    border: `2px solid ${agreed ? 'var(--accent-primary)' : 'var(--border-heavy)'}`,
                                    background: agreed ? 'var(--accent-primary)' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {agreed && <CheckCircle size={14} color="white" />}
                            </div>
                            <label
                                onClick={() => setAgreed(!agreed)}
                                style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
                            >
                                I agree to the <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Privacy Policy</span>.
                            </label>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    background: 'rgba(255, 107, 107, 0.1)',
                                    border: '1px solid rgba(255, 107, 107, 0.2)',
                                    color: '#ff6b6b',
                                    fontSize: 14,
                                    fontWeight: 500
                                }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                height: 54,
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                borderRadius: 16,
                                fontWeight: 700,
                                fontSize: 16,
                                border: 'none',
                                cursor: loading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                boxShadow: '0 12px 24px rgba(124, 108, 240, 0.3)',
                                transition: 'all 0.3s',
                                marginTop: 8
                            }}
                            className="hover-bright"
                        >
                            {loading ? <Loader2 size={24} className="animate-spin" /> : (
                                <>
                                    Enter the Dashboard <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div style={{
                    marginTop: 32, textAlign: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: 0.6, fontSize: 12, color: 'var(--text-tertiary)'
                }}>
                    <Shield size={14} />
                    Secure Identity Verification By Firebase
                </div>
            </motion.div>
        </div>
    );
}
