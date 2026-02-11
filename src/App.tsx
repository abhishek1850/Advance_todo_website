import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import XPBar from './components/XPBar';
import TaskModal from './components/TaskModal';
import Confetti from './components/Confetti';
import NotificationToast from './components/NotificationToast';
import Dashboard from './views/Dashboard';
import TodayView from './views/TodayView';
import MonthlyView from './views/MonthlyView';
import YearlyView from './views/YearlyView';
import AnalyticsView from './views/AnalyticsView';
import AchievementsView from './views/AchievementsView';
import type { ViewType } from './types';

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  today: "Today's Tasks",
  monthly: 'Monthly Goals',
  yearly: 'Yearly Vision',
  analytics: 'Analytics',
  achievements: 'Achievements',
};

const VIEW_KEYS: Record<string, ViewType> = {
  '1': 'dashboard',
  '2': 'today',
  '3': 'monthly',
  '4': 'yearly',
  '5': 'analytics',
  '6': 'achievements',
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '☀️ Good morning';
  if (hour < 17) return '🌤️ Good afternoon';
  if (hour < 21) return '🌆 Good evening';
  return '🌙 Good night';
}

function App() {
  const { currentView, setView, openTaskModal, showCelebration, lastCelebrationXP, dismissCelebration, isTaskModalOpen } = useStore();

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

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'today': return <TodayView />;
      case 'monthly': return <MonthlyView />;
      case 'yearly': return <YearlyView />;
      case 'analytics': return <AnalyticsView />;
      case 'achievements': return <AchievementsView />;
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
              <p className="header-greeting">{getGreeting()}</p>
              <h2 className="header-title">{VIEW_TITLES[currentView]}</h2>
              <p className="header-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="header-right">
            <XPBar />
            <button className="add-task-btn" onClick={() => openTaskModal()}>
              <Plus size={18} /> New Task
              <span className="kbd" style={{ marginLeft: 4, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}>N</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <TaskModal />
      <Confetti show={showCelebration} xp={lastCelebrationXP} onDone={handleCelebrationDone} />
      <NotificationToast />
    </div>
  );
}

export default App;
