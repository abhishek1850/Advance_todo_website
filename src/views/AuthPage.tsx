import { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { Loader2, Shield } from 'lucide-react';
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
            // setUser triggers the store logic to check/create user document in Firestore
            setUser(result.user);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled.');
            } else {
                setError('Failed to sign in with Google. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--gradient-bg)', position: 'relative', overflow: 'hidden',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Background Animations */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'var(--gradient-mesh)',
                pointerEvents: 'none', animation: 'meshFloat 20s ease-in-out infinite alternate',
            }} />

            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(124, 108, 240, 0.15) 0%, transparent 60%)',
                pointerEvents: 'none'
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    background: 'rgba(18, 18, 28, 0.85)',
                    backdropFilter: 'blur(32px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '60px 48px',
                    width: '100%',
                    maxWidth: 420,
                    textAlign: 'center',
                    boxShadow: '0 40px 80px -12px rgba(0,0,0,0.6)'
                }}
            >
                {/* Logo Icon */}
                <motion.div
                    style={{
                        margin: '0 auto 32px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
                    }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                >
                    <div style={{
                        width: 80, height: 80,
                        background: 'linear-gradient(135deg, rgba(124,108,240,0.1) 0%, rgba(0,212,207,0.1) 100%)',
                        borderRadius: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(124,108,240,0.15), inset 0 0 0 1px rgba(255,255,255,0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Inline SVG Logo matched to previous design */}
                        <svg width="48" height="48" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="authShield" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
                                    <stop offset="50%" style={{ stopColor: '#4A3DB8', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#2D1F8A', stopOpacity: 1 }} />
                                </linearGradient>
                                <linearGradient id="authBolt" x1="30%" y1="0%" x2="70%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
                                    <stop offset="20%" style={{ stopColor: '#00F0FF', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#E040FB', stopOpacity: 1 }} />
                                </linearGradient>
                                <linearGradient id="authVein" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#00F0FF', stopOpacity: 0.8 }} />
                                    <stop offset="100%" style={{ stopColor: '#7C6CF0', stopOpacity: 0.2 }} />
                                </linearGradient>
                                <radialGradient id="authLight" cx="50%" cy="40%" r="45%">
                                    <stop offset="0%" style={{ stopColor: '#00E5FF', stopOpacity: 0.4 }} />
                                    <stop offset="100%" style={{ stopColor: '#2D1F8A', stopOpacity: 0 }} />
                                </radialGradient>
                                <filter id="authGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b1" />
                                    <feMerge><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                            </defs>
                            <path d="M256 38 L448 124 C448 124 452 295 256 470 C60 295 64 124 64 124 Z" fill="url(#authShield)" />
                            <circle cx="256" cy="210" r="160" fill="url(#authLight)" opacity="0.6" />
                            <g filter="url(#authGlow)">
                                <path d="M295 90 L205 245 L265 245 L195 420 L225 420 L340 210 L275 210 Z" fill="url(#authBolt)" />
                            </g>
                        </svg>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                        Execute Without Excuses
                    </div>
                </motion.div>

                <h1 style={{
                    fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em',
                    marginBottom: 12, color: 'white'
                }}>
                    Welcome Back, Attacker
                </h1>

                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>
                    Sign in to access your missions.
                </p>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '12px', borderRadius: 12,
                            background: 'rgba(255, 82, 82, 0.1)', border: '1px solid rgba(255, 82, 82, 0.2)',
                            color: '#ff5252', fontSize: 14, marginBottom: 24
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    style={{
                        width: '100%', padding: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                        background: 'white', border: 'none',
                        borderRadius: 16, color: '#1f1f1f', cursor: 'pointer',
                        fontSize: 16, fontWeight: 600,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        opacity: loading ? 0.7 : 1
                    }}
                    onMouseOver={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    {loading ? <Loader2 size={20} className="spin" /> : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>

                <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 0.5 }}>
                    <Shield size={12} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'white' }}>Secured by Firebase</span>
                </div>

                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                `}</style>
            </motion.div>
        </div>
    );
}
