import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { auth } from '../lib/firebase';
import { sendEmailVerification, signOut, reload } from 'firebase/auth';
import { useStore } from '../store';

export default function VerificationPending() {
    const { user } = useStore();
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleResend = async () => {
        if (cooldown > 0 || !auth.currentUser) return;
        setSending(true);
        setMessage('');
        try {
            await sendEmailVerification(auth.currentUser);
            setMessage('Verification email sent! Please check your inbox.');
            setCooldown(60);
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/too-many-requests') {
                setMessage('Too many requests. Please wait a bit.');
                setCooldown(60);
            } else {
                setMessage('Failed to send email. Try again later.');
            }
        } finally {
            setSending(false);
        }
    };

    const handleReload = async () => {
        if (!auth.currentUser) return;
        await reload(auth.currentUser);
        // The onAuthStateChanged listener in App.tsx might not trigger on reload alone for specific property changes like emailVerified
        // So we might need to force a re-check or just let the user know to refresh the page
        window.location.reload();
    };

    const handleLogout = () => {
        signOut(auth).catch(console.error);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--gradient-bg)',
            position: 'relative',
            padding: 20
        }}>
            <div className="mesh-background" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4 }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: '100%',
                    maxWidth: 480,
                    background: 'rgba(12, 12, 20, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 24,
                    padding: 40,
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                    textAlign: 'center'
                }}
            >
                <div style={{
                    width: 80, height: 80,
                    background: 'rgba(124, 108, 240, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 0 32px rgba(124, 108, 240, 0.2)'
                }}>
                    <Mail size={40} color="var(--accent-primary)" />
                </div>

                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Verify Your Email</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
                    We've sent a verification link to<br />
                    <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button
                        onClick={handleResend}
                        disabled={sending || cooldown > 0}
                        className="btn"
                        style={{
                            background: 'var(--gradient-primary)',
                            color: 'white',
                            padding: '14px',
                            borderRadius: 12,
                            fontWeight: 600,
                            border: 'none',
                            cursor: (sending || cooldown > 0) ? 'not-allowed' : 'pointer',
                            opacity: (sending || cooldown > 0) ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                    >
                        {sending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
                        {!sending && cooldown === 0 && <ArrowRight size={18} />}
                    </button>

                    <button
                        onClick={handleReload}
                        className="btn"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-primary)',
                            padding: '14px',
                            borderRadius: 12,
                            fontWeight: 600,
                            border: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                    >
                        <RefreshCw size={18} />
                        I've Verified My Email
                    </button>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: 24, fontSize: 13, color: message.includes('sent') ? 'var(--accent-success)' : 'var(--accent-danger)' }}
                    >
                        {message}
                    </motion.div>
                )}

                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-tertiary)',
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            margin: '0 auto'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>

                <div style={{
                    marginTop: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: 'var(--text-tertiary)'
                }}>
                    <ShieldCheck size={12} /> Secure Access Required
                </div>
            </motion.div>
        </div>
    );
}
