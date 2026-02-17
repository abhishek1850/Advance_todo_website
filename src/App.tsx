import { useCallback, useEffect, lazy, Suspense } from 'react';
// import { AnimatePresence, motion } from 'framer-motion'; // Removed for performance
import { Plus, Loader2 } from 'lucide-react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import XPBar from './components/XPBar';
import TaskModal from './components/TaskModal';
import Confetti from './components/Confetti';
import NotificationToast from './components/NotificationToast';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy Load Views for Performance
const Dashboard = lazy(() => import('./views/Dashboard'));
const TodayView = lazy(() => import('./views/TodayView'));
const YesterdayView = lazy(() => import('./views/YesterdayView'));
const HistoryView = lazy(() => import('./views/HistoryView'));
const MonthlyView = lazy(() => import('./views/MonthlyView'));
const YearlyView = lazy(() => import('./views/YearlyView'));
const AnalyticsView = lazy(() => import('./views/AnalyticsView'));
const AchievementsView = lazy(() => import('./views/AchievementsView'));
const AuthPage = lazy(() => import('./views/AuthPage'));
const ProfileView = lazy(() => import('./views/ProfileView'));
const AssistantView = lazy(() => import('./views/AssistantView'));
const FocusView = lazy(() => import('./views/FocusView'));
const JournalView = lazy(() => import('./views/JournalView'));
const CompleteSignup = lazy(() => import('./views/CompleteSignup'));
const VerificationPending = lazy(() => import('./views/VerificationPending'));

import { auth } from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useSessionTimeout } from './components/MotivationEngine';
import { getSmartGreeting, WeatherIcon } from './lib/weather';
import FocusTimer from './components/FocusTimer';

import type { ViewType } from './types';

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  today: "Today's Tasks",
  yesterday: "Yesterday's Summary",
  history: 'History',
  monthly: 'Monthly Goals',
  yearly: 'Yearly Vision',
  analytics: 'Analytics',
  achievements: 'Achievements',
  profile: 'User Profile',
  assistant: 'AI Coach',
  focus: 'Focus Mode',
  journal: 'Attack Journal',
};

const VIEW_KEYS: Record<string, ViewType> = {
  '1': 'dashboard',
  '2': 'today',
  '0': 'history',
  '3': 'monthly',
  '4': 'yearly',
  '5': 'analytics',
  '6': 'achievements',
  '7': 'profile',
  '8': 'assistant',
  '9': 'focus',
  'j': 'journal',
};

function App() {
  const {
    user, setUser, authLoading, setAuthLoading, onboardingComplete,
    currentView, setView, openTaskModal, showCelebration, lastCelebrationXP, dismissCelebration, isTaskModalOpen, profile
  } = useStore();

  // Security: auto-logout after 30 minutes of inactivity
  useSessionTimeout(30 * 60 * 1000);

  // Dynamic document title
  useEffect(() => {
    document.title = `${VIEW_TITLES[currentView] || 'Dashboard'} — Attackers Arena`;
  }, [currentView]);

  useEffect(() => {
    if (profile?.preferences?.accentColor) {
      document.documentElement.style.setProperty('--accent-primary', profile.preferences.accentColor);
      // Optional: Add a lighter variant for hovers/backgrounds if needed, or rely on opacity
      // For now, just setting the primary accent is enough to change the theme feel
    }
  }, [profile?.preferences?.accentColor]);

  useEffect(() => {
    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading]);

  const handleCelebrationDone = useCallback(() => {
    dismissCelebration();
  }, [dismissCelebration]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      if (isTaskModalOpen) return;

      // N - New task
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openTaskModal();
      }
      // 1-6 - Switch views
      if (VIEW_KEYS[e.key]) {
        e.preventDefault();
        setView(VIEW_KEYS[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openTaskModal, setView, isTaskModalOpen]);

  if (authLoading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', color: 'var(--text-secondary)'
      }}>
        Loading...
      </div>
    );
  }


  if (!user) {
    return (
      <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>Loading...</div>}>
        <AuthPage />
      </Suspense>
    );
  }

  // ✅ New Verification Check
  if (!user.emailVerified) {
    return (
      <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>Loading...</div>}>
        <VerificationPending />
      </Suspense>
    );
  }

  // ✅ New Onboarding Check
  if (!onboardingComplete) {
    return (
      <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>Loading...</div>}>
        <CompleteSignup />
      </Suspense>
    );
  }



  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'today': return <TodayView />;
      case 'yesterday': return <YesterdayView />;
      case 'history': return <HistoryView />;
      case 'monthly': return <MonthlyView />;
      case 'yearly': return <YearlyView />;
      case 'analytics': return <AnalyticsView />;
      case 'achievements': return <AchievementsView />;
      case 'profile': return <ProfileView />;
      case 'assistant': return <AssistantView />;
      case 'focus': return <FocusView />;
      case 'journal': return <JournalView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <div>
              <div className="header-greeting" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {(() => {
                  const { text, type } = getSmartGreeting(user?.displayName || (profile?.name !== 'User' ? profile?.name : '') || '');
                  return (
                    <>
                      <WeatherIcon type={type} size={20} />
                      <span>{text}</span>
                    </>
                  );
                })()}
              </div>
              <h2 className="header-title">{VIEW_TITLES[currentView]}</h2>
              <p className="header-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="header-right">
            <FocusTimer className="header-focus-timer" />
            <XPBar />
            <button className="add-task-btn" onClick={() => openTaskModal()}>
              <Plus size={18} /> <span className="btn-text">New Task</span>
              <span className="kbd" style={{ marginLeft: 4, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}>N</span>
            </button>
          </div>
        </header>

        <ErrorBoundary>
          <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
              <Loader2 size={32} className="animate-spin" />
            </div>
          }>
            {renderView()}
          </Suspense>
        </ErrorBoundary>
      </main>



      <TaskModal />
      <Confetti show={showCelebration} xp={lastCelebrationXP} onDone={handleCelebrationDone} />
      <NotificationToast />
    </div>
  );
}

export default App;
