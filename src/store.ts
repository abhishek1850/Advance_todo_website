import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    Task, UserProfile, Badge, DailyChallenge, ViewType, TaskFilter, CompletionRecord, TaskHorizon
} from './types';
import { format, isToday, isThisMonth, isThisYear, differenceInDays, parseISO, startOfDay } from 'date-fns';

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
const XP_PER_LEVEL = 500;
const PRIORITY_XP: Record<string, number> = { low: 10, medium: 20, high: 35, critical: 50 };
const HORIZON_MULT: Record<string, number> = { daily: 1, monthly: 1.5, yearly: 2 };

const DEFAULT_BADGES: Badge[] = [
    { id: 'first_task', name: 'First Step', description: 'Complete your first task', icon: '🎯', unlockedAt: null, requirement: 'Complete 1 task', category: 'milestone' },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: '🔥', unlockedAt: null, requirement: '7-day streak', category: 'streak' },
    { id: 'streak_30', name: 'Monthly Master', description: '30-day streak', icon: '⚡', unlockedAt: null, requirement: '30-day streak', category: 'streak' },
    { id: 'streak_100', name: 'Centurion', description: '100-day streak', icon: '👑', unlockedAt: null, requirement: '100-day streak', category: 'streak' },
    { id: 'tasks_10', name: 'Getting Started', description: 'Complete 10 tasks', icon: '📋', unlockedAt: null, requirement: '10 tasks', category: 'completion' },
    { id: 'tasks_50', name: 'Productive', description: 'Complete 50 tasks', icon: '🚀', unlockedAt: null, requirement: '50 tasks', category: 'completion' },
    { id: 'tasks_100', name: 'Century Club', description: 'Complete 100 tasks', icon: '💯', unlockedAt: null, requirement: '100 tasks', category: 'completion' },
    { id: 'tasks_500', name: 'Task Legend', description: 'Complete 500 tasks', icon: '🏆', unlockedAt: null, requirement: '500 tasks', category: 'completion' },
    { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', unlockedAt: null, requirement: 'Level 5', category: 'milestone' },
    { id: 'level_10', name: 'Veteran', description: 'Reach level 10', icon: '🌟', unlockedAt: null, requirement: 'Level 10', category: 'milestone' },
    { id: 'all_horizons', name: 'Full Spectrum', description: 'Tasks in all 3 horizons', icon: '🌈', unlockedAt: null, requirement: 'All horizons', category: 'special' },
    { id: 'early_bird', name: 'Early Bird', description: '5 tasks before noon', icon: '🌅', unlockedAt: null, requirement: 'Early completions', category: 'special' },
];

const genDailyChallenge = (): DailyChallenge => {
    const c = [
        { title: 'Task Blitz', description: 'Complete 5 tasks today', type: 'complete_n' as const, target: 5, xpReward: 75 },
        { title: 'Triple Threat', description: 'Complete 3 high-priority tasks', type: 'category' as const, target: 3, xpReward: 100 },
        { title: 'Quick Wins', description: '3 tasks under 15 min', type: 'time_based' as const, target: 3, xpReward: 60 },
        { title: 'Horizon Hopper', description: 'Tasks from 2 horizons', type: 'category' as const, target: 2, xpReward: 80 },
        { title: 'Marathoner', description: 'Complete 8 tasks', type: 'complete_n' as const, target: 8, xpReward: 120 },
        { title: 'Category Master', description: 'Complete tasks in 3 categories', type: 'category' as const, target: 3, xpReward: 85 },
    ];
    const ch = c[Math.floor(Math.random() * c.length)];
    return { id: generateId(), ...ch, isCompleted: false, date: format(new Date(), 'yyyy-MM-dd'), progress: 0 };
};

export interface Notification {
    id: string;
    type: 'xp' | 'badge' | 'level' | 'info' | 'challenge';
    title: string;
    message: string;
    icon: string;
}

interface AppState {
    tasks: Task[];
    profile: UserProfile;
    currentView: ViewType;
    filter: TaskFilter;
    completionHistory: CompletionRecord[];
    showCelebration: boolean;
    lastCelebrationXP: number;
    isTaskModalOpen: boolean;
    editingTask: Task | null;
    notifications: Notification[];
    setView: (view: ViewType) => void;
    setFilter: (filter: TaskFilter) => void;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'isCompleted' | 'xpValue' | 'postponedCount'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTask: (id: string) => void;
    toggleSubtask: (taskId: string, subtaskId: string) => void;
    openTaskModal: (task?: Task) => void;
    closeTaskModal: () => void;
    dismissCelebration: () => void;
    addNotification: (n: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    getFilteredTasks: () => Task[];
    getTodaysTasks: () => Task[];
    getMonthlyTasks: () => Task[];
    getYearlyTasks: () => Task[];
    getCompletionRate: (horizon?: TaskHorizon) => number;
    getStreak: () => number;
    getTodaysFocus: () => Task | null;
    getCategoryStats: () => { category: string; completed: number; total: number }[];
    getWeeklyCompletionData: () => { day: string; completed: number; total: number }[];
    getProductivityScore: () => number;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            tasks: [],
            profile: {
                name: 'User', level: 1, xp: 0, xpToNextLevel: XP_PER_LEVEL,
                totalTasksCompleted: 0, currentStreak: 0, longestStreak: 0,
                lastActiveDate: format(new Date(), 'yyyy-MM-dd'),
                joinedDate: format(new Date(), 'yyyy-MM-dd'),
                badges: [...DEFAULT_BADGES],
                dailyChallenge: genDailyChallenge(),
                preferences: { theme: 'dark', celebrationsEnabled: true, soundEnabled: true, defaultHorizon: 'daily', defaultPriority: 'medium' },
            },
            currentView: 'dashboard',
            filter: {},
            completionHistory: [],
            showCelebration: false,
            lastCelebrationXP: 0,
            isTaskModalOpen: false,
            editingTask: null,
            notifications: [],

            setView: (view) => set({ currentView: view }),
            setFilter: (filter) => set({ filter }),

            addTask: (taskData) => {
                const xpValue = Math.round(PRIORITY_XP[taskData.priority] * HORIZON_MULT[taskData.horizon]);
                const newTask: Task = { ...taskData, id: generateId(), createdAt: new Date().toISOString(), completedAt: null, isCompleted: false, xpValue, postponedCount: 0 };
                set((state) => ({ tasks: [...state.tasks, newTask] }));
            },

            updateTask: (id, updates) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
            deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

            toggleTask: (id) => {
                const state = get();
                const task = state.tasks.find((t) => t.id === id);
                if (!task) return;
                const isCompleting = !task.isCompleted;
                const now = new Date();
                const today = format(now, 'yyyy-MM-dd');
                const p = { ...state.profile };
                let showCeleb = false;
                let celebXP = 0;
                const newNotifications: Omit<Notification, 'id'>[] = [];
                const prevLevel = p.level;

                if (isCompleting) {
                    p.xp += task.xpValue;
                    p.totalTasksCompleted += 1;
                    celebXP = task.xpValue;
                    while (p.xp >= p.xpToNextLevel) { p.xp -= p.xpToNextLevel; p.level += 1; p.xpToNextLevel = Math.round(XP_PER_LEVEL * Math.pow(1.15, p.level - 1)); }

                    // Level up notification
                    if (p.level > prevLevel) {
                        newNotifications.push({ type: 'level', title: 'Level Up!', message: `You've reached Level ${p.level}! 🎉`, icon: '🆙' });
                    }

                    const lastActive = p.lastActiveDate;
                    if (lastActive !== today) {
                        const diff = differenceInDays(parseISO(today), parseISO(lastActive));
                        p.currentStreak = diff === 1 ? p.currentStreak + 1 : 1;
                    }
                    p.longestStreak = Math.max(p.longestStreak, p.currentStreak);
                    p.lastActiveDate = today;

                    const badges = [...p.badges];
                    const unlock = (bid: string) => {
                        const b = badges.find((x) => x.id === bid);
                        if (b && !b.unlockedAt) {
                            b.unlockedAt = now.toISOString();
                            newNotifications.push({ type: 'badge', title: 'Badge Unlocked!', message: `${b.icon} ${b.name}`, icon: '🏅' });
                        }
                    };
                    if (p.totalTasksCompleted >= 1) unlock('first_task');
                    if (p.totalTasksCompleted >= 10) unlock('tasks_10');
                    if (p.totalTasksCompleted >= 50) unlock('tasks_50');
                    if (p.totalTasksCompleted >= 100) unlock('tasks_100');
                    if (p.totalTasksCompleted >= 500) unlock('tasks_500');
                    if (p.currentStreak >= 7) unlock('streak_7');
                    if (p.currentStreak >= 30) unlock('streak_30');
                    if (p.currentStreak >= 100) unlock('streak_100');
                    if (p.level >= 5) unlock('level_5');
                    if (p.level >= 10) unlock('level_10');
                    const horizons = new Set(state.tasks.filter((t) => t.isCompleted || t.id === id).map((t) => t.horizon));
                    if (horizons.size >= 3) unlock('all_horizons');
                    p.badges = badges;

                    if (p.dailyChallenge && p.dailyChallenge.date === today && !p.dailyChallenge.isCompleted) {
                        const ch = { ...p.dailyChallenge };

                        // Get all tasks completed today (including the one just completed)
                        const completedToday = state.tasks.filter(t =>
                            (t.isCompleted && t.id !== id && t.completedAt && isToday(parseISO(t.completedAt))) ||
                            (t.id === id) // The current task is being completed
                        );
                        // Add the current task explicitly to the list for calculation if it wasn't already in valid state (it wasn't)
                        const allCompleted = [...completedToday.filter(t => t.id !== id), task];

                        let progress = 0;

                        if (ch.title === 'Task Blitz' || ch.title === 'Marathoner') {
                            progress = allCompleted.length;
                        } else if (ch.title === 'Triple Threat') {
                            progress = allCompleted.filter(t => t.priority === 'high' || t.priority === 'critical').length;
                        } else if (ch.title === 'Quick Wins') {
                            progress = allCompleted.filter(t => t.estimatedMinutes < 15).length;
                        } else if (ch.title === 'Horizon Hopper') {
                            progress = new Set(allCompleted.map(t => t.horizon)).size;
                        } else if (ch.title === 'Category Master') {
                            progress = new Set(allCompleted.map(t => t.category).filter(Boolean)).size;
                        } else {
                            progress = allCompleted.length;
                        }

                        if (progress > ch.progress) {
                            ch.progress = progress;
                            if (ch.progress >= ch.target) {
                                ch.isCompleted = true;
                                p.xp += ch.xpReward;
                                newNotifications.push({ type: 'challenge', title: 'Challenge Complete!', message: `+${ch.xpReward} XP bonus earned`, icon: '⚡' });
                            }
                            p.dailyChallenge = ch;
                        }
                    }
                    showCeleb = p.preferences.celebrationsEnabled;
                    const hist = [...state.completionHistory];
                    const rec = hist.find((r) => r.date === today);
                    if (rec) { rec.completed += 1; rec.xpEarned += task.xpValue; }
                    else hist.push({ date: today, completed: 1, total: 1, xpEarned: task.xpValue });

                    // Add XP notification
                    newNotifications.push({ type: 'xp', title: `+${task.xpValue} XP`, message: `"${task.title}" completed`, icon: '✨' });

                    // Add all queued notifications
                    const notificationsToAdd = newNotifications.map(n => ({ ...n, id: generateId() }));

                    set({
                        tasks: state.tasks.map((t) => t.id === id ? { ...t, isCompleted: true, completedAt: now.toISOString() } : t),
                        profile: p, showCelebration: showCeleb, lastCelebrationXP: celebXP, completionHistory: hist,
                        notifications: [...state.notifications, ...notificationsToAdd],
                    });
                } else {
                    p.xp = Math.max(0, p.xp - task.xpValue);
                    p.totalTasksCompleted = Math.max(0, p.totalTasksCompleted - 1);
                    set({ tasks: state.tasks.map((t) => t.id === id ? { ...t, isCompleted: false, completedAt: null } : t), profile: p });
                }
            },

            toggleSubtask: (taskId, subtaskId) => set((s) => ({
                tasks: s.tasks.map((t) => t.id === taskId ? { ...t, subtasks: t.subtasks.map((st) => st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st) } : t),
            })),

            openTaskModal: (task) => set({ isTaskModalOpen: true, editingTask: task || null }),
            closeTaskModal: () => set({ isTaskModalOpen: false, editingTask: null }),
            dismissCelebration: () => set({ showCelebration: false }),

            addNotification: (n) => set((s) => ({ notifications: [...s.notifications, { ...n, id: generateId() }] })),
            removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),

            getFilteredTasks: () => {
                const { tasks, filter } = get();
                return tasks.filter((t) => {
                    if (filter.horizon && t.horizon !== filter.horizon) return false;
                    if (filter.priority && t.priority !== filter.priority) return false;
                    if (filter.category && t.category !== filter.category) return false;
                    if (filter.energyLevel && t.energyLevel !== filter.energyLevel) return false;
                    if (filter.isCompleted !== undefined && t.isCompleted !== filter.isCompleted) return false;
                    if (filter.search) { const s = filter.search.toLowerCase(); if (!t.title.toLowerCase().includes(s) && !t.description.toLowerCase().includes(s)) return false; }
                    return true;
                });
            },
            getTodaysTasks: () => get().tasks.filter((t) => { if (t.horizon !== 'daily') return false; if (!t.dueDate) return true; return isToday(parseISO(t.dueDate)) || parseISO(t.dueDate) <= startOfDay(new Date()); }),
            getMonthlyTasks: () => get().tasks.filter((t) => { if (t.horizon !== 'monthly') return false; if (!t.dueDate) return true; return isThisMonth(parseISO(t.dueDate)); }),
            getYearlyTasks: () => get().tasks.filter((t) => { if (t.horizon !== 'yearly') return false; if (!t.dueDate) return true; return isThisYear(parseISO(t.dueDate)); }),
            getCompletionRate: (horizon) => { const ts = horizon ? get().tasks.filter((t) => t.horizon === horizon) : get().tasks; if (!ts.length) return 0; return Math.round((ts.filter((t) => t.isCompleted).length / ts.length) * 100); },
            getStreak: () => get().profile.currentStreak,
            getTodaysFocus: () => {
                const inc = get().getTodaysTasks().filter((t) => !t.isCompleted);
                if (!inc.length) return null;
                const po: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                inc.sort((a, b) => { const d = po[a.priority] - po[b.priority]; if (d !== 0) return d; if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate); return 0; });
                return inc[0];
            },
            getCategoryStats: () => {
                const { tasks } = get();
                const cats = [...new Set(tasks.map((t) => t.category).filter(Boolean))];
                return cats.map((c) => { const ct = tasks.filter((t) => t.category === c); return { category: c, completed: ct.filter((t) => t.isCompleted).length, total: ct.length }; });
            },
            getWeeklyCompletionData: () => {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const { tasks } = get();
                return days.map((day, i) => {
                    const done = tasks.filter((t) => t.completedAt && parseISO(t.completedAt).getDay() === i).length;
                    const tot = tasks.filter((t) => t.dueDate && parseISO(t.dueDate).getDay() === i).length;
                    return { day, completed: done, total: Math.max(tot, done) };
                });
            },
            getProductivityScore: () => {
                const state = get();
                const rate = state.getCompletionRate();
                const streakBonus = Math.min(state.profile.currentStreak * 2, 20);
                const levelBonus = Math.min(state.profile.level, 10);
                return Math.min(100, Math.round(rate * 0.7 + streakBonus + levelBonus));
            },
        }),
        {
            name: 'todo-app-storage',
            version: 2,
            partialize: (state) => ({
                tasks: state.tasks,
                profile: state.profile,
                completionHistory: state.completionHistory,
                currentView: state.currentView,
            }),
        }
    )
);
