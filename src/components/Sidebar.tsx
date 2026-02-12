import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Sun, Calendar, Target, BarChart3, Trophy, Menu, X, User, BrainCircuit, LogOut, Download } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { useStore } from '../store';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import type { ViewType } from '../types';
import { useState, useEffect } from 'react';
import { playSound } from '../lib/sounds';
import ConfirmDialog from './ConfirmDialog';

const navItems: { id: ViewType; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, shortcut: '1' },
    { id: 'today', label: "Today's Tasks", icon: <Sun size={20} />, shortcut: '2' },
    { id: 'monthly', label: 'Monthly Goals', icon: <Calendar size={20} />, shortcut: '3' },
    { id: 'yearly', label: 'Yearly Vision', icon: <Target size={20} />, shortcut: '4' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, shortcut: '5' },
    { id: 'achievements', label: 'Achievements', icon: <Trophy size={20} />, shortcut: '6' },
    { id: 'profile', label: 'Profile', icon: <User size={20} />, shortcut: '7' },
    { id: 'assistant', label: 'AI Coach', icon: <BrainCircuit size={20} />, shortcut: '8' },
];

export default function Sidebar() {
    const { currentView, setView, profile, getTodaysTasks } = useStore();
    const { isInstallable, installApp, isIOS, isStandalone } = usePWA();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const todayIncomplete = getTodaysTasks().filter(t => !t.isCompleted).length;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sidebarVariants = {
        desktop: { x: 0, opacity: 1 },
        mobileClosed: { x: '-100%', opacity: 1 },
        mobileOpen: { x: 0, opacity: 1 },
    };

    return (
        <>
            {/* Mobile Menu Button - Floating & Premium */}
            <AnimatePresence>
                {isMobile && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mobile-toggle-btn"
                        onClick={() => { playSound('click'); setMobileOpen(!mobileOpen); }}
                        style={{
                            position: 'fixed',
                            top: 'max(16px, env(safe-area-inset-top))',
                            left: 'max(16px, env(safe-area-inset-left))',
                            zIndex: 200,
                            padding: 12,
                            borderRadius: '50%',
                            background: mobileOpen ? 'rgba(255, 107, 107, 0.2)' : 'rgba(124, 108, 240, 0.2)',
                            color: mobileOpen ? 'var(--accent-danger)' : 'var(--accent-primary)',
                            border: `1px solid ${mobileOpen ? 'rgba(255, 107, 107, 0.3)' : 'rgba(124, 108, 240, 0.3)'}`,
                            backdropFilter: 'blur(12px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            cursor: 'pointer'
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {mobileOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className="sidebar"
                initial={false}
                animate={isMobile ? (mobileOpen ? 'mobileOpen' : 'mobileClosed') : 'desktop'}
                variants={sidebarVariants}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 280,
                    zIndex: 190
                }}
            >
                <div className="sidebar-logo">
                    <motion.div
                        style={{ position: 'relative', width: 44, height: 44, cursor: 'pointer' }}
                        whileHover={{ scale: 1.12 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    >
                        <div className="sidebar-logo-icon" style={{ position: 'relative', zIndex: 2 }}>
                            <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="ss" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#6C5CE7', stopOpacity: 1 }} />
                                        <stop offset="50%" style={{ stopColor: '#4A3DB8', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: '#2D1F8A', stopOpacity: 1 }} />
                                    </linearGradient>
                                    <linearGradient id="se" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 0.6 }} />
                                        <stop offset="100%" style={{ stopColor: '#6C5CE7', stopOpacity: 0.1 }} />
                                    </linearGradient>
                                    <linearGradient id="sb" x1="30%" y1="0%" x2="70%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
                                        <stop offset="20%" style={{ stopColor: '#00F0FF', stopOpacity: 1 }} />
                                        <stop offset="50%" style={{ stopColor: '#00D4FF', stopOpacity: 1 }} />
                                        <stop offset="80%" style={{ stopColor: '#A78BFA', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: '#E040FB', stopOpacity: 1 }} />
                                    </linearGradient>
                                    <radialGradient id="sl" cx="50%" cy="40%" r="45%">
                                        <stop offset="0%" style={{ stopColor: '#00E5FF', stopOpacity: 0.35 }} />
                                        <stop offset="50%" style={{ stopColor: '#6C5CE7', stopOpacity: 0.1 }} />
                                        <stop offset="100%" style={{ stopColor: '#2D1F8A', stopOpacity: 0 }} />
                                    </radialGradient>
                                    <clipPath id="sc">
                                        <path d="M256 38 L448 124 C448 124 452 295 256 470 C60 295 64 124 64 124 Z" />
                                    </clipPath>
                                    <filter id="sg" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b1" />
                                        <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b2" />
                                        <feMerge>
                                            <feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                {/* Shield body */}
                                <path d="M256 38 L448 124 C448 124 452 295 256 470 C60 295 64 124 64 124 Z" fill="url(#ss)" />
                                <path d="M256 38 L448 124 C448 124 452 295 256 470 C60 295 64 124 64 124 Z" fill="none" stroke="url(#se)" strokeWidth="3" />
                                {/* Inner light */}
                                <g clipPath="url(#sc)">
                                    <circle cx="256" cy="210" r="200" fill="url(#sl)" className="aa-inner-light" />
                                </g>
                                {/* Lightning bolt */}
                                <g filter="url(#sg)">
                                    <path className="aa-bolt" d="M295 90 L205 245 L265 245 L195 420 L225 420 L340 210 L275 210 Z" fill="url(#sb)" />
                                </g>
                                {/* Bolt highlight */}
                                <path d="M290 105 L215 240 L260 240 L210 390" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.25" strokeLinecap="round" />
                                {/* Electric Rings (Visible on Hover) */}
                                <g className="aa-spinner-group" style={{ transformOrigin: '256px 256px' }}>
                                    <circle cx="256" cy="256" r="230" fill="none" stroke="url(#sb)" strokeWidth="4" strokeDasharray="20 60 40 40" strokeLinecap="round" className="aa-ring-1" style={{ opacity: 0 }} />
                                    <circle cx="256" cy="256" r="215" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="50 100" strokeLinecap="round" className="aa-ring-2" style={{ opacity: 0 }} />
                                    <circle cx="256" cy="256" r="245" fill="none" stroke="url(#se)" strokeWidth="6" strokeDasharray="10 80 5 40" strokeLinecap="round" className="aa-ring-3" style={{ opacity: 0 }} />
                                </g>
                            </svg>
                        </div>
                        <style>{`
                            @keyframes aaLight {
                                0%, 100% { opacity: 0.3; }
                                50% { opacity: 0.65; }
                            }
                            @keyframes electric {
                                0%, 100% { filter: drop-shadow(0 0 2px #00d4ff); opacity: 1; }
                                3% { filter: drop-shadow(0 0 15px #ffffff); opacity: 1; }
                                6% { filter: drop-shadow(0 0 5px #00d4ff); opacity: 0.8; }
                                7% { filter: drop-shadow(0 0 2px #00d4ff); transform: scale(1.02); }
                                8% { filter: drop-shadow(0 0 2px #00d4ff); transform: scale(1); }
                                40% { filter: drop-shadow(0 0 3px #00d4ff); }
                                42% { filter: drop-shadow(0 0 20px #ffffff) brightness(1.5); }
                                44% { filter: drop-shadow(0 0 5px #00d4ff); }
                                90% { filter: drop-shadow(0 0 4px #00d4ff); opacity: 0.7; }
                                92% { filter: drop-shadow(0 0 15px #ffffff) brightness(1.2); opacity: 1; }
                            }
                            @keyframes ringSpin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                            @keyframes ringSpinRev {
                                0% { transform: rotate(360deg); }
                                100% { transform: rotate(0deg); }
                            }
                            @keyframes electricIntense {
                                0%, 100% { filter: drop-shadow(0 0 5px #00d4ff) brightness(1.2); opacity: 1; transform: scale(1.1); }
                                25% { filter: drop-shadow(0 0 20px #ffffff) brightness(2); transform: scale(1.05) translateX(-2px); }
                                50% { filter: drop-shadow(0 0 8px #00d4ff); opacity: 0.8; transform: scale(1.15) translateY(2px); }
                                75% { filter: drop-shadow(0 0 25px #ffffff) brightness(2.5); transform: scale(1.08) translateX(2px); }
                            }

                            .aa-inner-light {
                                animation: aaLight 3s ease-in-out infinite;
                            }
                            .aa-bolt {
                                animation: electric 3s infinite linear;
                                transform-origin: center;
                            }
                            
                            /* Hover effects */
                            .sidebar-logo:hover .aa-ring-1 {
                                opacity: 1 !important;
                                animation: ringSpin 1s linear infinite;
                                filter: drop-shadow(0 0 8px #00d4ff);
                            }
                            .sidebar-logo:hover .aa-ring-2 {
                                opacity: 0.8 !important;
                                animation: ringSpinRev 0.6s linear infinite;
                                filter: drop-shadow(0 0 5px #ffffff);
                            }
                            .sidebar-logo:hover .aa-ring-3 {
                                opacity: 0.6 !important;
                                animation: ringSpin 2s linear infinite;
                                filter: drop-shadow(0 0 12px #a78bfa);
                            }
                            .sidebar-logo:hover .aa-bolt {
                                animation: electricIntense 0.08s infinite !important;
                            }
                            /* Remove whole svg spin */
                            .sidebar-logo:hover .sidebar-logo-icon svg {
                                animation: none;
                            }
                        `}</style>
                    </motion.div>
                    <h1>Attackers Arena</h1>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <motion.button
                            key={item.id}
                            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => { playSound('click'); setView(item.id); if (isMobile) setMobileOpen(false); }}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                            {item.id === 'today' && todayIncomplete > 0 && (
                                <span className="nav-item-badge">{todayIncomplete}</span>
                            )}
                            {!isMobile && (item.id !== 'today' || todayIncomplete === 0) ? (
                                <span className="nav-shortcut">{item.shortcut}</span>
                            ) : null}
                        </motion.button>
                    ))}
                </nav>

                <div className="sidebar-stats">
                    <div className="stat-row">
                        <span className="stat-label">Level</span>
                        <span className="stat-value">{profile.level}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Streak</span>
                        <span className="stat-value streak">🔥 {profile.currentStreak}</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value">{profile.totalTasksCompleted}</span>
                    </div>
                </div>

                <div className="sidebar-footer" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Install App Button */}
                    {/* Install App Button */}
                    {!isStandalone && (
                        <motion.button
                            className="install-btn"
                            onClick={() => {
                                playSound('click');
                                if (isInstallable) {
                                    installApp();
                                } else if (isIOS) {
                                    alert("To install on iOS:\n1. Tap the 'Share' button\n2. Scroll down and tap 'Add to Home Screen'");
                                } else {
                                    // If clicked but not ready, show a helpful toast/alert instead of generic error
                                    alert("App isn't ready for one-click install yet.\n\nTry reloading the page, or use your browser menu to 'Add to Home Screen'.");
                                }
                            }
                            }
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 16px', margin: '0 20px',
                                background: isInstallable ? 'rgba(108, 92, 231, 0.2)' : 'rgba(108, 92, 231, 0.05)',
                                border: isInstallable ? '1px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.1)',
                                borderRadius: 12,
                                color: isInstallable ? '#fff' : '#6C5CE7',
                                cursor: 'pointer', fontSize: 14, fontWeight: 500,
                                transition: 'all 0.2s',
                                width: 'calc(100% - 40px)',
                                boxShadow: isInstallable ? '0 0 10px rgba(108, 92, 231, 0.3)' : 'none'
                            }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(108, 92, 231, 0.2)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Download size={18} />
                            <span>Install App</span>
                        </motion.button>
                    )}

                    <button
                        onClick={() => {
                            playSound('click');
                            setShowLogoutConfirm(true);
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 16px', margin: '0 20px 24px',
                            background: 'rgba(255, 82, 82, 0.1)', border: '1px solid rgba(255, 82, 82, 0.15)',
                            borderRadius: 12, color: '#ff5252',
                            cursor: 'pointer', fontSize: 14, fontWeight: 500,
                            transition: 'all 0.2s',
                            width: 'calc(100% - 40px)'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 82, 82, 0.2)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 82, 82, 0.1)'; }}
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </motion.aside >

            {/* Backdrop for mobile */}
            <AnimatePresence>
                {
                    isMobile && mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 180
                            }}
                            onClick={() => setMobileOpen(false)}
                        />
                    )
                }
            </AnimatePresence >

            <ConfirmDialog
                isOpen={showLogoutConfirm}
                title="Log Out"
                message="Are you sure you want to end your session?"
                confirmText="Yes, Log Out"
                cancelText="Cancel"
                onConfirm={() => signOut(auth)}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </>
    );
}

