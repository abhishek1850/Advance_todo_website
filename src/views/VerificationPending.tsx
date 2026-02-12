import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../lib/firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { Mail, RefreshCw, LogOut, CheckCircle, ShieldAlert } from 'lucide-react';
import { useStore } from '../store';

export default function VerificationPending() {
    const { user } = useStore();
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResend = async () => {
        if (!user) return;
        setSending(true);
        setMessage('');
        setError('');
        try {
            await sendEmailVerification(user);
            setMessage('Verification link sent! Check your inbox (and spam folder).');
        } catch (err: any) {
            if (err.code === 'auth/too-many-requests') {
                setError('Too many requests. Please wait a moment before trying again.');
            } else {
                setError('Failed to send email. Please try again later.');
            }
        } finally {
            setSending(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        window.location.reload(); // Force reload to clear state cleanly
    };

    const checkVerification = async () => {
        if (!user) return;
        await user.reload();
        if (user.emailVerified) {
            window.location.reload(); // Will trigger App to render the main dashboard
        } else {
            setMessage('Email not verified yet. Please click the link in your email.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--gradient-bg)', position: 'relative', overflow: 'hidden',
            fontFamily: 'Inter, sans-serif', color: 'white'
        }}>
            {/* Background Animations */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'var(--gradient-mesh)',
                pointerEvents: 'none', animation: 'meshFloat 20s ease-in-out infinite alternate',
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'rgba(18, 18, 28, 0.85)',
                    backdropFilter: 'blur(32px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '48px',
                    width: '100%',
                    maxWidth: 480,
                    textAlign: 'center',
                    boxShadow: '0 40px 80px -12px rgba(0,0,0,0.6)'
                }}
            >
                <div style={{
                    width: 72, height: 72, margin: '0 auto 24px',
                    background: 'rgba(124,108,240,0.1)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(124,108,240,0.2)'
                }}>
                    <Mail size={32} color="#7c6cf0" />
                </div>

                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Verify Your Email</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 32 }}>
                    We've sent a verification link to <strong>{user?.email}</strong>.<br />
                    Please confirm your email to access the Arena.
                </p>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '12px', borderRadius: 12,
                            background: 'rgba(0, 200, 83, 0.1)', border: '1px solid rgba(0, 200, 83, 0.2)',
                            color: '#66bb6a', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                    >
                        <CheckCircle size={16} /> {message}
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '12px', borderRadius: 12,
                            background: 'rgba(255, 82, 82, 0.1)', border: '1px solid rgba(255, 82, 82, 0.2)',
                            color: '#ff5252', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                    >
                        <ShieldAlert size={16} /> {error}
                    </motion.div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button
                        onClick={checkVerification}
                        style={{
                            padding: '14px', borderRadius: 12,
                            background: 'var(--gradient-primary)', border: 'none',
                            color: 'white', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            fontSize: 15
                        }}
                    >
                        I've Verified My Email
                    </button>

                    <button
                        onClick={handleResend}
                        disabled={sending}
                        style={{
                            padding: '14px', borderRadius: 12,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', fontWeight: 500, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            fontSize: 14, opacity: sending ? 0.7 : 1
                        }}
                    >
                        {sending ? <RefreshCw size={16} className="spin" /> : <RefreshCw size={16} />}
                        Resend Verification Email
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'none', border: 'none',
                            color: 'rgba(255,255,255,0.4)', fontSize: 13,
                            cursor: 'pointer', marginTop: 12,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                    >
                        <LogOut size={14} /> Sign Out / Change Email
                    </button>
                </div>

                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                `}</style>
            </motion.div>
        </div>
    );
}
