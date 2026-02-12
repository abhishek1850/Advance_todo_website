import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { AlertCircle, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle, Shield, XCircle } from 'lucide-react';
import { useStore } from '../store';

// ============================================
// Password Strength Validator
// ============================================
interface PasswordStrength {
    score: number; // 0-4
    label: string;
    color: string;
    checks: { label: string; passed: boolean }[];
}

function getPasswordStrength(password: string): PasswordStrength {
    const checks = [
        { label: 'At least 8 characters', passed: password.length >= 8 },
        { label: 'Contains uppercase letter', passed: /[A-Z]/.test(password) },
        { label: 'Contains lowercase letter', passed: /[a-z]/.test(password) },
        { label: 'Contains a number', passed: /[0-9]/.test(password) },
        { label: 'Contains special character', passed: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password) },
    ];

    const score = checks.filter(c => c.passed).length;

    const labels: Record<number, { label: string; color: string }> = {
        0: { label: 'Very Weak', color: '#ff4444' },
        1: { label: 'Weak', color: '#ff6b6b' },
        2: { label: 'Fair', color: '#ffa726' },
        3: { label: 'Good', color: '#66bb6a' },
        4: { label: 'Strong', color: '#00c853' },
        5: { label: 'Excellent', color: '#00e676' },
    };

    return { score, ...labels[score], checks };
}

// ============================================
// Email validation
// ============================================
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// Friendly Firebase error messages
// ============================================
function getFriendlyError(code: string): string {
    const map: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled.',
        'auth/weak-password': 'Password should be at least 8 characters with letters, numbers, and symbols.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment before trying again.',
        'auth/popup-closed-by-user': 'Sign-in cancelled.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/invalid-credential': 'Invalid email or password. Please try again.',
    };
    return map[code] || 'Authentication failed. Please try again.';
}

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { setUser } = useStore();

    const passwordStrength = isSignUp ? getPasswordStrength(password) : null;

    const handleEmailAuth = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Client-side validation
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (isSignUp) {
            if (password.length < 8) {
                setError('Password must be at least 8 characters long.');
                return;
            }
            const strength = getPasswordStrength(password);
            if (strength.score < 3) {
                setError('Please use a stronger password with uppercase, lowercase, numbers, and special characters.');
                return;
            }
        }

        setLoading(true);

        try {
            if (isSignUp) {
                const { user } = await createUserWithEmailAndPassword(auth, email, password);
                setUser(user);
            } else {
                const { user } = await signInWithEmailAndPassword(auth, email, password);
                setUser(user);
            }
        } catch (err: any) {
            setError(getFriendlyError(err.code || ''));
        } finally {
            setLoading(false);
        }
    }, [email, password, isSignUp, setUser]);

    const handleGoogleSignIn = useCallback(async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setUser(result.user);
        } catch (err: any) {
            setError(getFriendlyError(err.code || ''));
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    const handleForgotPassword = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isValidEmail(email)) {
            setError('Please enter your email address first.');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess('Password reset email sent! Check your inbox.');
        } catch (err: any) {
            setError(getFriendlyError(err.code || ''));
        } finally {
            setLoading(false);
        }
    }, [email]);

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
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    background: 'rgba(18, 18, 28, 0.85)',
                    backdropFilter: 'blur(32px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '60px 48px',
                    width: '100%',
                    maxWidth: 440,
                    position: 'relative',
                    boxShadow: '0 40px 80px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                    textAlign: 'center'
                }}
            >
                {/* Logo Icon */}
                <motion.div
                    style={{
                        margin: '0 auto 24px',
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
                        <motion.div
                            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                            <svg width="48" height="48" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="authShield" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
                                        <stop offset="50%" style={{ stopColor: '#4A3DB8', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: '#2D1F8A', stopOpacity: 1 }} />
                                    </linearGradient>
                                    <linearGradient id="authEdge" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 0.6 }} />
                                        <stop offset="100%" style={{ stopColor: '#6C5CE7', stopOpacity: 0.1 }} />
                                    </linearGradient>
                                    <linearGradient id="authBolt" x1="30%" y1="0%" x2="70%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
                                        <stop offset="20%" style={{ stopColor: '#00F0FF', stopOpacity: 1 }} />
                                        <stop offset="50%" style={{ stopColor: '#00D4FF', stopOpacity: 1 }} />
                                        <stop offset="80%" style={{ stopColor: '#A78BFA', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: '#E040FB', stopOpacity: 1 }} />
                                    </linearGradient>
                                    <linearGradient id="authVein" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#00F0FF', stopOpacity: 0.8 }} />
                                        <stop offset="100%" style={{ stopColor: '#7C6CF0', stopOpacity: 0.2 }} />
                                    </linearGradient>
                                    <radialGradient id="authLight" cx="50%" cy="40%" r="45%">
                                        <stop offset="0%" style={{ stopColor: '#00E5FF', stopOpacity: 0.4 }} />
                                        <stop offset="50%" style={{ stopColor: '#6C5CE7', stopOpacity: 0.1 }} />
                                        <stop offset="100%" style={{ stopColor: '#2D1F8A', stopOpacity: 0 }} />
                                    </radialGradient>
                                    <clipPath id="authClip">
                                        <path d="M256 38 L448 124 C448 124 452 295 256 470 C60 295 64 124 64 124 Z" />
                                    </clipPath>
                                    <filter id="authGlow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b1" />
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b2" />
                                        <feMerge><feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                </defs>
                                <g filter="url(#authGlow)" opacity="0.4">
                                    <circle cx="256" cy="250" r="180" fill="url(#authLight)" />
                                </g>
                                <path d="M256 38 L448 124 C448 124 452 295 256 470 C60 295 64 124 64 124 Z" fill="url(#authShield)" />
                                <path d="M256 38 L448 124 C448 124 452 295 256 470 C60 295 64 124 64 124 Z" fill="none" stroke="url(#authEdge)" strokeWidth="3" />
                                <g clipPath="url(#authClip)">
                                    <circle cx="256" cy="210" r="200" fill="url(#authLight)" className="auth-pulse" />
                                    <polyline points="230,180 190,155 170,120" fill="none" stroke="url(#authVein)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                                    <polyline points="280,170 320,145 345,118" fill="none" stroke="url(#authVein)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                                    <polyline points="210,250 175,265 140,260" fill="none" stroke="url(#authVein)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                                    <polyline points="310,230 340,240 375,235" fill="none" stroke="url(#authVein)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                                </g>
                                <g filter="url(#authGlow)">
                                    <path d="M295 90 L205 245 L265 245 L195 420 L225 420 L340 210 L275 210 Z" fill="url(#authBolt)" />
                                </g>
                                <path d="M290 105 L215 240 L260 240 L210 390" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
                            </svg>
                        </motion.div>
                        <style>{`
                            @keyframes authPulse { 0% { opacity: 0.3; transform: scale(0.95); } 50% { opacity: 0.6; transform: scale(1.05); } 100% { opacity: 0.3; transform: scale(0.95); } }
                            .auth-pulse { animation: authPulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; transform-origin: center; }
                        `}</style>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                        Execute Without Excuses
                    </div>
                </motion.div>

                {/* Security Badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(0, 200, 83, 0.1)', border: '1px solid rgba(0, 200, 83, 0.2)',
                    padding: '4px 12px', borderRadius: 20, marginBottom: 16,
                    fontSize: 11, color: '#66bb6a', fontWeight: 600,
                }}>
                    <Shield size={12} /> Secured with Firebase Auth
                </div>

                <h1 style={{
                    fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em',
                    marginBottom: 12,
                    background: 'linear-gradient(to right, #fff, #b4b4b4)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    {showForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>

                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16, lineHeight: 1.5, marginBottom: 32 }}>
                    {showForgotPassword
                        ? "Enter your email and we'll send a reset link."
                        : isSignUp
                            ? 'Enter the arena. Execute without excuses.'
                            : 'Welcome back, Attacker. Your missions await.'}
                </p>

                {/* Error Alert */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                padding: '12px 16px', borderRadius: 12,
                                background: 'rgba(255, 82, 82, 0.1)', border: '1px solid rgba(255, 82, 82, 0.2)',
                                color: '#ff5252', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                marginBottom: 24
                            }}
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Alert */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                padding: '12px 16px', borderRadius: 12,
                                background: 'rgba(0, 200, 83, 0.1)', border: '1px solid rgba(0, 200, 83, 0.2)',
                                color: '#66bb6a', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                marginBottom: 24
                            }}
                        >
                            <CheckCircle size={18} />
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {showForgotPassword ? (
                    // Forgot Password Form
                    <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value.trim())}
                                    required
                                    maxLength={255}
                                    style={{
                                        width: '100%', padding: '14px 14px 14px 44px',
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 14, color: 'white', fontSize: 15,
                                        outline: 'none', transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                background: 'var(--gradient-primary)', border: 'none',
                                borderRadius: 16, color: 'white', cursor: 'pointer',
                                fontSize: 16, fontWeight: 600,
                                opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
                                boxShadow: '0 8px 24px rgba(124, 108, 240, 0.25)'
                            }}
                        >
                            {loading ? <Loader2 size={20} className="spin" /> : <>Send Reset Link <Mail size={18} /></>}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setShowForgotPassword(false); setError(''); setSuccess(''); }}
                            style={{
                                background: 'none', border: 'none', padding: 0,
                                color: 'var(--accent-primary)', fontWeight: 600,
                                cursor: 'pointer', fontSize: 14, marginTop: 8,
                            }}
                        >
                            ← Back to Sign In
                        </button>
                    </form>
                ) : (
                    // Main Auth Form
                    <>
                        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group" style={{ textAlign: 'left' }}>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value.trim())}
                                        required
                                        maxLength={255}
                                        autoComplete="email"
                                        style={{
                                            width: '100%', padding: '14px 14px 14px 44px',
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 14, color: 'white', fontSize: 15,
                                            outline: 'none', transition: 'all 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ textAlign: 'left' }}>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        maxLength={128}
                                        autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                        style={{
                                            width: '100%', padding: '14px 44px 14px 44px',
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 14, color: 'white', fontSize: 15,
                                            outline: 'none', transition: 'all 0.2s',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer', padding: 0, display: 'flex'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Strength Indicator (only on sign up) */}
                            <AnimatePresence>
                                {isSignUp && password.length > 0 && passwordStrength && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            {/* Strength Bar */}
                                            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            flex: 1, height: 4, borderRadius: 2,
                                                            background: i <= passwordStrength.score ? passwordStrength.color : 'rgba(255,255,255,0.1)',
                                                            transition: 'all 0.3s'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: passwordStrength.color, marginBottom: 8 }}>
                                                {passwordStrength.label}
                                            </div>
                                            {/* Checks */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {passwordStrength.checks.map((check, i) => (
                                                    <div key={i} style={{
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        fontSize: 11, color: check.passed ? 'rgba(102, 187, 106, 0.9)' : 'rgba(255,255,255,0.35)',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        {check.passed ?
                                                            <CheckCircle size={12} color="#66bb6a" /> :
                                                            <XCircle size={12} color="rgba(255,255,255,0.2)" />
                                                        }
                                                        {check.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Forgot Password Link */}
                            {!isSignUp && (
                                <div style={{ textAlign: 'right', marginTop: -8 }}>
                                    <button
                                        type="button"
                                        onClick={() => { setShowForgotPassword(true); setError(''); }}
                                        style={{
                                            background: 'none', border: 'none', padding: 0,
                                            color: 'rgba(255,255,255,0.5)', fontSize: 13,
                                            cursor: 'pointer', transition: 'color 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                                        onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    background: 'var(--gradient-primary)', border: 'none',
                                    borderRadius: 16, color: 'white', cursor: 'pointer',
                                    fontSize: 16, fontWeight: 600,
                                    marginTop: 8,
                                    opacity: loading ? 0.7 : 1, transition: 'transform 0.2s, box-shadow 0.2s',
                                    boxShadow: '0 8px 24px rgba(124, 108, 240, 0.25)'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(124, 108, 240, 0.4)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 108, 240, 0.25)'; }}
                            >
                                {loading ? <Loader2 size={20} className="spin" /> : (
                                    <>
                                        {isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '24px 0' }}>
                            <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.1)' }} />
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or continue with</span>
                            <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.1)' }} />
                        </div>

                        <div style={{ display: 'flex', gap: 16 }}>
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '14px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                                    background: 'white', border: '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: 16, color: '#1f1f1f', cursor: 'pointer',
                                    fontSize: 15, fontWeight: 600,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                    }
                                }}
                            >
                                {loading ? <Loader2 size={20} style={{ color: '#555' }} className="spin" /> : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
                                    </>
                                )}
                            </button>
                        </div>

                        <div style={{ marginTop: 24, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); setPassword(''); }}
                                style={{
                                    background: 'none', border: 'none', padding: 0,
                                    color: 'var(--accent-primary)', fontWeight: 600,
                                    cursor: 'pointer', fontSize: 'inherit'
                                }}
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </div>
                    </>
                )}

                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                `}</style>
            </motion.div>
        </div>
    );
}
