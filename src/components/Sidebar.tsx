import { motion } from 'framer-motion';
import { LayoutDashboard, Sun, Calendar, Target, BarChart3, Trophy, Menu, X, User } from 'lucide-react';
import { useStore } from '../store';
import type { ViewType } from '../types';
import { useState } from 'react';

const navItems: { id: ViewType; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, shortcut: '1' },
    { id: 'today', label: "Today's Tasks", icon: <Sun size={20} />, shortcut: '2' },
    { id: 'monthly', label: 'Monthly Goals', icon: <Calendar size={20} />, shortcut: '3' },
    { id: 'yearly', label: 'Yearly Vision', icon: <Target size={20} />, shortcut: '4' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, shortcut: '5' },
    { id: 'achievements', label: 'Achievements', icon: <Trophy size={20} />, shortcut: '6' },
    { id: 'profile', label: 'Profile', icon: <User size={20} />, shortcut: '7' },
];

export default function Sidebar() {
    const { currentView, setView, profile, getTodaysTasks } = useStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const todayIncomplete = getTodaysTasks().filter(t => !t.isCompleted).length;

    return (
        <>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ position: 'fixed', top: 16, left: 16, zIndex: 150 }}>
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <motion.aside className={`sidebar ${mobileOpen ? 'open' : ''}`} initial={{ x: -260 }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
                <div className="sidebar-logo">
                    <motion.div
                        className="sidebar-logo-icon"
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.4 }}
                    >
                        ✦
                    </motion.div>
                    <h1>TaskFlow</h1>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <motion.button
                            key={item.id}
                            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => { setView(item.id); setMobileOpen(false); }}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                            {item.id === 'today' && todayIncomplete > 0 && (
                                <span className="nav-item-badge">{todayIncomplete}</span>
                            )}
                            {item.id !== 'today' || todayIncomplete === 0 ? (
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
            </motion.aside>

            {mobileOpen && <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99 }}
                onClick={() => setMobileOpen(false)}
            />}
        </>
    );
}
