import { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { Mail, Lock, User, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '../store';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { setUser } = useStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                setUser(userCredential.user);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name || 'User' });
                setUser(userCredential.user);
            }
        } catch (err: any) {
            console.error(err);
            let msg = 'Something went wrong';
            if (err.code === 'auth/invalid-email') msg = 'Invalid email address';
            if (err.code === 'auth/user-disabled') msg = 'User account disabled';
            if (err.code === 'auth/user-not-found') msg = 'User not found';
            if (err.code === 'auth/wrong-password') msg = 'Incorrect password';
            if (err.code === 'auth/email-already-in-use') msg = 'Email already in use';
            if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters';
            if (err.code === 'auth/invalid-credential') msg = 'Invalid credentials';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--gradient-bg)', position: 'relative',
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                background: 'var(--gradient-mesh)',
                pointerEvents: 'none', animation: 'meshFloat 20s ease-in-out infinite alternate',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                style={{
                    background: 'rgba(12, 12, 20, 0.85)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 40,
                    width: '100%',
                    maxWidth: 420,
                    position: 'relative',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
                }}
            >
                {/* Top glow line */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(124,108,240,0.4), rgba(0,212,207,0.2), transparent)',
                    borderRadius: '24px 24px 0 0',
                }} />

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <motion.div
                        style={{
                            width: 56, height: 56, margin: '0 auto 16px',
                            background: 'var(--gradient-primary)', borderRadius: 16,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 28, boxShadow: '0 8px 24px rgba(124,108,240,0.3)',
                        }}
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                        ✦
                    </motion.div>
                    <h1 style={{
                        fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px',
                        background: 'var(--gradient-primary)', backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        animation: 'gradientShift 4s ease infinite',
                    }}>
                        TaskFlow
                    </h1>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginTop: 4 }}>
                        {isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {!isLogin && (
                        <motion.div className="form-group" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={14} /> Name
                            </label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </motion.div>
                    )}

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Mail size={14} /> Email
                        </label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Lock size={14} /> Password
                        </label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)',
                                color: 'var(--accent-danger)', fontSize: 13,
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '12px', marginTop: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div style={{ marginTop: 16 }}>
                    <button
                        type="button"
                        onClick={async () => {
                            setError('');
                            setLoading(true);
                            try {
                                const result = await signInWithPopup(auth, googleProvider);
                                setUser(result.user);
                            } catch (err: any) {
                                console.error(err);
                                setError('Failed to sign in with Google');
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className="btn"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--text-primary)', cursor: 'pointer',
                            opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>

                {/* Toggle */}
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    </span>
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{
                            background: 'none', border: 'none', color: 'var(--accent-primary)',
                            cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font)',
                        }}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
