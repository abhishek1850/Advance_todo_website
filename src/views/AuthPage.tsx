import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Shield } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useStore } from '../store';

export default function AuthPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { setUser } = useStore();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Allow Google Auth logic:
            // Previously restricted to existing users, now open to all.
            setUser(user);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled.');
            } else {
                setError('Failed to sign in with Google.');
            }
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
            {/* Background effects */}
            <div className="mesh-background" style={{ opacity: 0.6 }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    width: '100%',
                    maxWidth: 440,
                    padding: 20,
                    zIndex: 10,
                }}
            >
                {/* Logo Area */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            width: 64, height: 64,
                            margin: '0 auto 16px',
                            background: 'linear-gradient(135deg, #6C5CE7 0%, #4A3DB8 100%)',
                            borderRadius: 16,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(108, 92, 231, 0.3)',
                            position: 'relative'
                        }}
                    >
                        <Shield size={32} color="white" fill="rgba(255,255,255,0.2)" strokeWidth={2.5} />
                        <div style={{
                            position: 'absolute', inset: -2, borderRadius: 18,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.4), transparent)',
                            zIndex: -1, opacity: 0.5
                        }} />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            fontSize: 28, fontWeight: 900,
                            background: 'linear-gradient(to right, #fff, #a5a6c2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: 8,
                            letterSpacing: '-0.5px'
                        }}
                    >
                        Attackers Arena
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ color: 'var(--text-tertiary)', fontSize: 14 }}
                    >
                        Sign in with Google to access your missions
                    </motion.p>
                </div>

                {/* Auth Card */}
                <div style={{
                    background: 'rgba(12, 12, 20, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 24,
                    padding: '32px 28px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                }}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginBottom: 16, padding: '10px 14px', borderRadius: 8,
                                background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.2)',
                                color: 'var(--accent-danger)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(108, 92, 231, 0.05))',
                            color: 'var(--text-primary)',
                            padding: '16px',
                            borderRadius: 12,
                            fontWeight: 600,
                            border: '1px solid var(--border-subtle)',
                            cursor: loading ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                            transition: 'all 0.2s',
                            fontSize: 15
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(108, 92, 231, 0.15), rgba(108, 92, 231, 0.08))'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(108, 92, 231, 0.05))'}
                    >
                        {loading ? (
                            <><Loader2 size={20} className="animate-spin" /> Signing in...</>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign in with Google
                            </>
                        )}
                    </button>
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: 32, textAlign: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    opacity: 0.5, fontSize: 12, color: 'var(--text-tertiary)'
                }}>
                    <Shield size={12} />
                    Secured by Firebase
                </div>
            </motion.div>
        </div>
    );
}
