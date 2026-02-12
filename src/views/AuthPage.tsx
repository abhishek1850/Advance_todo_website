import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Loader2, Shield, ArrowRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { useStore } from '../store';

type AuthMode = 'signin' | 'signup' | 'forgot-password';

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { setUser } = useStore();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setUser(result.user);
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

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            if (mode === 'signup') {
                // Sign Up Logic
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                await sendEmailVerification(userCredential.user);

                // Triggers App flow -> VerificationPending
                setUser(userCredential.user);
            } else if (mode === 'signin') {
                // Sign In Logic
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                setUser(userCredential.user);
            } else if (mode === 'forgot-password') {
                // Reset Password Logic
                await sendPasswordResetEmail(auth, email);
                setSuccessMessage('Password reset email sent! Check your inbox.');
                setLoading(false);
                return; // Don't redirect or set user
            }
        } catch (err: any) {
            console.error(err);
            const errorCode = err.code;
            let errorMessage = 'Authentication failed.';

            if (errorCode === 'auth/email-already-in-use') errorMessage = 'Email is already in use.';
            else if (errorCode === 'auth/invalid-email') errorMessage = 'Invalid email address.';
            else if (errorCode === 'auth/weak-password') errorMessage = 'Password should be at least 6 characters.';
            else if (errorCode === 'auth/user-not-found') errorMessage = 'No account found with this email.';
            else if (errorCode === 'auth/wrong-password') errorMessage = 'Incorrect password.';
            else if (errorCode === 'auth/too-many-requests') errorMessage = 'Too many attempts. Try again later.';
            else if (errorCode === 'auth/invalid-credential') errorMessage = 'Invalid credentials.';

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = (newMode: AuthMode) => {
        setMode(newMode);
        setError('');
        setSuccessMessage('');
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
                        {mode === 'signin' ? 'Sign in to access your missions' :
                            mode === 'signup' ? 'Join the arena and start winning' :
                                'Recover your account access'}
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
                    <form onSubmit={handleEmailAuth}>
                        <AnimatePresence mode="wait">
                            {mode === 'signup' && (
                                <motion.div
                                    key="name"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className="form-group" style={{ marginBottom: 16 }}>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-tertiary)' }} />
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Full Name"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required={mode === 'signup'}
                                                style={{ paddingLeft: 42, width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-tertiary)' }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    style={{ paddingLeft: 42, width: '100%' }}
                                />
                            </div>
                        </div>

                        {mode !== 'forgot-password' && (
                            <div className="form-group" style={{ marginBottom: mode === 'signin' ? 8 : 20 }}>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', top: 12, left: 14, color: 'var(--text-tertiary)' }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-input"
                                        placeholder="Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        style={{ paddingLeft: 42, paddingRight: 42, width: '100%' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', top: 12, right: 12,
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--text-tertiary)'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {mode === 'signin' && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                                <button
                                    type="button"
                                    onClick={() => toggleMode('forgot-password')}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: 'var(--accent-primary)', fontSize: 13, fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

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
                                <AlertTriangle size={14} /> {error}
                            </motion.div>
                        )}

                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    marginBottom: 16, padding: '10px 14px', borderRadius: 8,
                                    background: 'rgba(0, 214, 143, 0.1)', border: '1px solid rgba(0, 214, 143, 0.2)',
                                    color: 'var(--accent-success)', fontSize: 13
                                }}
                            >
                                {successMessage}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn"
                            style={{
                                width: '100%',
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: 12,
                                fontWeight: 600,
                                border: 'none',
                                cursor: loading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: '0 4px 12px rgba(124, 108, 240, 0.3)',
                                transition: 'all 0.2s',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : (mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link')}
                        </button>
                    </form>

                    {mode !== 'forgot-password' && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: 12 }}>
                                <div style={{ height: 1, flex: 1, background: 'var(--border-subtle)' }} />
                                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>OR CONTINUE WITH</span>
                                <div style={{ height: 1, flex: 1, background: 'var(--border-subtle)' }} />
                            </div>

                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'var(--text-primary)',
                                    padding: '12px',
                                    borderRadius: 12,
                                    fontWeight: 600,
                                    border: '1px solid var(--border-subtle)',
                                    cursor: loading ? 'wait' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </>
                    )}

                    <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
                        {mode === 'signin' ? (
                            <>
                                <span style={{ color: 'var(--text-tertiary)' }}>Don't have an account? </span>
                                <button
                                    onClick={() => toggleMode('signup')}
                                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Sign Up
                                </button>
                            </>
                        ) : mode === 'signup' ? (
                            <>
                                <span style={{ color: 'var(--text-tertiary)' }}>Already have an account? </span>
                                <button
                                    onClick={() => toggleMode('signin')}
                                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Sign In
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => toggleMode('signin')}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '0 auto' }}
                            >
                                <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Sign In
                            </button>
                        )}
                    </div>
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
