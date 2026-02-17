import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, AtSign, ArrowRight, Loader2, Rocket } from 'lucide-react';
import { useStore } from '../store';

export default function CompleteSignup() {
    const { user, completeOnboarding } = useStore();
    const [name, setName] = useState(user?.displayName || '');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !username.trim()) {
            setError('Please fill in all fields');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await completeOnboarding({ name, username });
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to complete setup');
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
        }}>
            <div className="mesh-background" style={{ opacity: 0.6 }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: '100%',
                    maxWidth: 480,
                    padding: 24,
                    zIndex: 10,
                }}
            >
                <div style={{
                    background: 'rgba(12, 12, 20, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 32,
                    padding: '40px 32px',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative element */}
                    <div style={{
                        position: 'absolute', top: -100, right: -100,
                        width: 200, height: 200,
                        background: 'radial-gradient(circle, rgba(108, 92, 231, 0.15) 0%, transparent 70%)',
                        zIndex: -1
                    }} />

                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{
                            width: 64, height: 64,
                            background: 'var(--gradient-primary)',
                            borderRadius: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 8px 24px rgba(108, 92, 231, 0.3)'
                        }}>
                            <Rocket size={32} color="white" />
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 8 }}>
                            Welcome to the Arena
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                            Let's set up your operative profile
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '12px 16px',
                                    background: 'rgba(255, 107, 107, 0.1)',
                                    border: '1px solid rgba(255, 107, 107, 0.2)',
                                    borderRadius: 12,
                                    color: '#ff6b6b',
                                    fontSize: 14
                                }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 8, marginLeft: 4 }}>
                                FULL NAME
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: 14,
                                        padding: '14px 14px 14px 44px',
                                        color: 'white',
                                        fontSize: 15,
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    className="focus-ring"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 8, marginLeft: 4 }}>
                                CODENAME (USERNAME)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <AtSign size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                    placeholder="choose_your_handle"
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: 14,
                                        padding: '14px 14px 14px 44px',
                                        color: 'white',
                                        fontSize: 15,
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    className="focus-ring"
                                />
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6, marginLeft: 4 }}>
                                This will be your unique identifier in the arena.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: 12,
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 14,
                                padding: '16px',
                                fontSize: 16,
                                fontWeight: 700,
                                cursor: loading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                boxShadow: '0 8px 24px rgba(108, 92, 231, 0.25)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? (
                                <><Loader2 size={20} className="animate-spin" /> Preparing Arena...</>
                            ) : (
                                <><ArrowRight size={20} /> Initialize Operative</>
                            )}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-tertiary)', opacity: 0.6 }}>
                    By continuing, you agree to the Arena Rules of Engagement.
                </p>
            </motion.div>
        </div>
    );
}
