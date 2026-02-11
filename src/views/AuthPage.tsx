import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Loader2, Sparkles } from 'lucide-react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { name: name || 'User' } }
                });
                if (error) throw error;
                setMessage('Check your email for confirmation link!');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
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

                    {message && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                background: 'rgba(0,214,143,0.1)', border: '1px solid rgba(0,214,143,0.2)',
                                color: 'var(--accent-success)', fontSize: 13,
                            }}
                        >
                            {message}
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

                {/* Toggle */}
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    </span>
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
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
