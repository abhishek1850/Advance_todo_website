import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    Task, TaskTemplate, TaskInstance, UserProfile, Badge, DailyChallenge, ViewType, TaskFilter, CompletionRecord, TaskHorizon, JournalEntry, AIConversation, AIChatMessage
} from './types';
import { format, differenceInDays, parseISO, startOfWeek, addDays, subDays, startOfMonth, startOfYear, getWeek } from 'date-fns';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp, orderBy, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './lib/firebase';
import { playSound } from './lib/sounds';
import { generateAIResponse } from './lib/ai';
const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
const XP_PER_LEVEL = 500;
const PRIORITY_XP: Record<string, number> = { low: 10, medium: 20, high: 35, critical: 50 };
const HORIZON_MULT: Record<string, number> = { daily: 1, monthly: 1.5, yearly: 2 };

const getJournalStreak = (journals: JournalEntry[]) => {
    if (!journals.length) return 0;
    const sorted = [...journals].sort((a, b) => b.date.localeCompare(a.date));
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(now, 1), 'yyyy-MM-dd');

    if (sorted[0].date !== todayStr && sorted[0].date !== yesterdayStr) return 0;

    let streak = 0;
    let checkDate = parseISO(sorted[0].date);

    for (const j of sorted) {
        if (j.date === format(checkDate, 'yyyy-MM-dd')) {
            streak++;
            checkDate = subDays(checkDate, 1);
        } else {
            break;
        }
    }
    return streak;
};

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
    user: User | null;
    authLoading: boolean;
    templates: TaskTemplate[];
    instances: TaskInstance[];
    tasks: Task[]; // Legacy/Hydrated holder
    profile: UserProfile;
    currentView: ViewType;
    filter: TaskFilter;
    completionHistory: CompletionRecord[];
    showCelebration: boolean;
    lastCelebrationXP: number;
    isTaskModalOpen: boolean;
    editingTask: Task | null;
    notifications: Notification[];
    onboardingComplete: boolean;
    setUser: (user: User | null) => void;
    setAuthLoading: (loading: boolean) => void;
    setView: (view: ViewType | 'complete-signup') => void;
    completeOnboarding: (data: { username: string; name: string }) => Promise<void>;
    setFilter: (filter: TaskFilter) => void;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'isCompleted' | 'xpValue' | 'postponedCount'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    toggleTask: (id: string, date?: string) => Promise<void>;
    toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
    openTaskModal: (task?: Task) => void;
    closeTaskModal: () => void;
    dismissCelebration: () => void;
    addNotification: (n: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    pendingAssistantMessage?: string;
    setPendingAssistantMessage: (msg: string | undefined) => void;
    checkDailyLogic: () => Promise<void>;
    getFilteredTasks: () => Task[];
    getTodaysTasks: () => Task[];
    getYesterdayTasks: () => Task[];
    getStagnantTasks: () => Task[];
    getMonthlyTasks: () => Task[];
    getYearlyTasks: () => Task[];
    getCompletionRate: (horizon?: TaskHorizon) => number;
    getStreak: () => number;
    getTodaysFocus: () => Task | null;
    getCategoryStats: () => { category: string; completed: number; total: number }[];
    getWeeklyCompletionData: () => { day: string; completed: number; total: number }[];
    getMonthlyCompletionData: () => { day: string; completed: number; total: number }[];
    getWeeklyHistory: () => any[];
    getProductivityScore: () => number;
    journalEntries: JournalEntry[];
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'xpEarned' | 'weekNumber'>) => Promise<void>;
    updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
    deleteJournalEntry: (id: string) => Promise<void>;
    fetchJournalEntries: () => Promise<void>;
    conversations: AIConversation[];
    activeConversationMessages: AIChatMessage[];
    activeConversationId: string | null;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<void>;
    setActiveConversation: (id: string | null) => void;
    sendAssistantMessage: (content: string, context: any) => Promise<void>;
    clearConversation: (id: string) => Promise<void>;
}

const INITIAL_PROFILE: UserProfile = {
    name: 'User', level: 1, xp: 0, xpToNextLevel: XP_PER_LEVEL,
    totalTasksCompleted: 0, currentStreak: 0, longestStreak: 0,
    lastActiveDate: format(new Date(), 'yyyy-MM-dd'),
    joinedDate: format(new Date(), 'yyyy-MM-dd'),
    badges: [...DEFAULT_BADGES],
    dailyChallenge: genDailyChallenge(),
    preferences: { theme: 'dark', celebrationsEnabled: true, soundEnabled: true, defaultHorizon: 'daily', defaultPriority: 'medium', accentColor: '#7c6cf0', autoRollover: true, rolloverMultiplier: true },
    onboardingComplete: false,
};

const INITIAL_STATE = {
    templates: [],
    instances: [],
    tasks: [],
    profile: INITIAL_PROFILE,
    completionHistory: [],
    notifications: [],
    showCelebration: false,
    lastCelebrationXP: 0,
    isTaskModalOpen: false,
    editingTask: null,
    onboardingComplete: false,
    filter: {},
    currentView: 'dashboard' as ViewType,
    journalEntries: [],
    conversations: [],
    activeConversationMessages: [],
    activeConversationId: null,
};

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            user: null,
            authLoading: true,
            ...INITIAL_STATE,

            setUser: async (user) => {
                if (import.meta.env.DEV) console.log("🔄 setUser triggered for:", user?.uid);
                if (!user) {
                    if (import.meta.env.DEV) console.log("📤 Logging out - clearing state");
                    set({ user: null, ...INITIAL_STATE, authLoading: false });
                    localStorage.removeItem('todo-app-storage');
                    return;
                }

                // 1. RESET STATE to initial FIRST - this clears any stale localStorage data
                if (import.meta.env.DEV) console.log("🧹 Resetting state for fresh fetch...");
                set({ user, ...INITIAL_STATE, authLoading: true });

                try {
                    // 2. Fetch User Data from Firestore
                    if (import.meta.env.DEV) console.log("📡 Fetching user data from Firestore...");
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (import.meta.env.DEV) console.log("✅ Firestore data received:", {
                            templatesCount: data.tasks?.length || 0,
                            instancesCount: data.instances?.length || 0
                        });

                        // 3. Verify Ownership (Security check)
                        if (data.uid && data.uid !== user.uid) {
                            console.error('⛔ SECURITY ALERT: Fetched document ID does not match Auth UID!');
                            throw new Error('Security Mismatch');
                        }

                        // 4. CRITICAL: Update State - Replace completely with Firestore data
                        const newState = {
                            templates: data.tasks || [],
                            instances: data.instances || [],
                            tasks: [], // Hydrated on demand
                            profile: { ...get().profile, ...data.profile, onboardingComplete: true },
                            onboardingComplete: true,
                            completionHistory: data.completionHistory || [],
                        };

                        // Validate data integrity
                        if (import.meta.env.DEV) {
                            console.log("📊 Data validation:");
                            console.log("  - Templates:", newState.templates.length, "items");
                            console.log("  - Instances:", newState.instances.length, "items");
                            console.log("  - All templates have userId:", newState.templates.every((t: any) => t.userId === user.uid));
                            console.log("  - All instances have userId:", newState.instances.every((i: any) => i.userId === user.uid));
                        }

                        set(newState);

                        if (import.meta.env.DEV) console.log("💾 State updated from Firestore. Templates:", get().templates.length);

                        // Generate instances immediately
                        await get().checkDailyLogic();
                        await get().fetchJournalEntries();
                    } else {
                        if (import.meta.env.DEV) console.log("✨ New user detected (no Firestore doc yet)");
                    }
                } catch (error) {
                    console.error("❌ Error loading user data from Firestore:", error);
                } finally {
                    set({ authLoading: false });
                    if (import.meta.env.DEV) console.log("🕒 Auth loading finished.");
                }
            },

            completeOnboarding: async ({ username, name }) => {
                const state = get();
                const user = state.user;
                if (!user) return;

                if (import.meta.env.DEV) console.log("🚀 Completing onboarding for:", username);

                const newUserProfile: UserProfile = {
                    ...state.profile,
                    name,
                    username,
                    onboardingComplete: true,
                    joinedDate: new Date().toISOString()
                };

                const userDoc = {
                    uid: user.uid,
                    email: user.email,
                    name: name,
                    photoURL: user.photoURL,
                    username: username,
                    createdAt: new Date().toISOString(),
                    onboardingComplete: true,
                    profile: newUserProfile,
                    tasks: state.templates, // ✅ FIX: Use templates, not tasks
                    instances: state.instances,
                    completionHistory: state.completionHistory
                };

                try {
                    await setDoc(doc(db, 'users', user.uid), userDoc);
                    if (import.meta.env.DEV) console.log("✅ Onboarding document created in Firestore");
                    set({
                        profile: newUserProfile,
                        onboardingComplete: true,
                        currentView: 'dashboard'
                    });
                } catch (error) {
                    console.error("❌ Firestore write failed during onboarding:", error);
                }
            },
            setAuthLoading: (loading) => set({ authLoading: loading }),
            pendingAssistantMessage: undefined,
            setPendingAssistantMessage: (msg) => set({ pendingAssistantMessage: msg }),
            checkDailyLogic: async () => {
                const state = get();
                const now = new Date();
                const today = format(now, 'yyyy-MM-dd');
                const currentMonthStart = format(startOfMonth(now), 'yyyy-MM-dd');
                const currentYearStart = format(startOfYear(now), 'yyyy-MM-dd');

                let newInstances = [...state.instances];
                let hasChanges = false;

                // 1. Generate Instances for All Types
                state.templates.forEach(t => {
                    if (t.archived) return; // Skip archived tasks for future generation

                    let targetDate = today;
                    if (t.horizon === 'monthly') targetDate = currentMonthStart;
                    if (t.horizon === 'yearly') targetDate = currentYearStart;

                    const instanceId = `${t.id}_${targetDate}`;
                    if (!newInstances.find(i => i.id === instanceId)) {
                        newInstances.push({
                            id: instanceId,
                            taskId: t.id,
                            userId: t.userId,
                            date: targetDate,
                            status: 'pending',
                            completedAt: null
                        });
                        hasChanges = true;
                    }

                    // For Daily: also backfill last 3 days
                    if (t.horizon === 'daily') {
                        [1, 2, 3].forEach(daysAgo => {
                            const d = format(subDays(now, daysAgo), 'yyyy-MM-dd');
                            const backfillId = `${t.id}_${d}`;
                            if (!newInstances.find(i => i.id === backfillId) && t.createdAt <= d) {
                                newInstances.push({
                                    id: backfillId, taskId: t.id, userId: t.userId, date: d, status: 'missed', completedAt: null
                                });
                                hasChanges = true;
                            }
                        });
                    }
                });

                // 2. Mark pending instances from past days as missed (only for Daily)
                newInstances = newInstances.map(i => {
                    const tmpl = state.templates.find(t => t.id === i.taskId);
                    if (i.date < today && i.status === 'pending' && tmpl?.horizon === 'daily') {
                        hasChanges = true;
                        return { ...i, status: 'missed' as const };
                    }
                    return i;
                });

                if (hasChanges) {
                    set({ instances: newInstances });
                    if (state.user) {
                        if (import.meta.env.DEV) console.log("📡 Updating instances in Firestore after daily logic...");
                        setDoc(doc(db, 'users', state.user.uid), { instances: newInstances }, { merge: true })
                            .then(() => { if (import.meta.env.DEV) console.log("✅ Firestore instances updated."); })
                            .catch(error => console.error("❌ Firestore write failed:", error));
                    }
                }
            },
            setView: (view) => set({ currentView: view }),
            setFilter: (filter) => set({ filter }),

            addTask: async (taskData) => {
                const state = get();
                const xpValue = Math.round(PRIORITY_XP[taskData.priority] * HORIZON_MULT[taskData.horizon]);
                const id = generateId();
                const now = new Date();
                const today = format(now, 'yyyy-MM-dd');

                if (import.meta.env.DEV) console.log("📝 Adding goal task:", taskData.title);

                const newTemplate: TaskTemplate = {
                    ...taskData,
                    id,
                    userId: state.user?.uid,
                    type: (taskData.horizon === 'monthly' ? 'monthly' : taskData.horizon === 'yearly' ? 'yearly' : taskData.recurrence === 'daily' ? 'daily' : 'one-time') as any,
                    createdAt: now.toISOString(),
                    subtasks: [],
                    xpValue,
                    tags: taskData.tags || []
                };

                let targetDate = today;
                if (newTemplate.horizon === 'monthly') targetDate = format(startOfMonth(now), 'yyyy-MM-dd');
                if (newTemplate.horizon === 'yearly') targetDate = format(startOfYear(now), 'yyyy-MM-dd');

                const newInstances: TaskInstance[] = [
                    ...state.instances,
                    {
                        id: `${id}_${targetDate}`,
                        taskId: id,
                        userId: state.user?.uid,
                        date: targetDate,
                        status: 'pending' as const,
                        completedAt: null
                    }
                ];

                const newTemplates = [...state.templates, newTemplate];

                // 1. Update Local State
                set({ templates: newTemplates, instances: newInstances });
                if (import.meta.env.DEV) console.log("💾 Local state updated. Templates count:", get().templates.length);

                // 2. Persist to Firestore immediately (use setDoc with merge to create or update)
                if (state.user) {
                    if (import.meta.env.DEV) console.log("📡 Saving new task to Firestore...");
                    try {
                        // Use setDoc with merge - creates document if doesn't exist, updates if does
                        await setDoc(doc(db, 'users', state.user.uid), {
                            uid: state.user.uid, // Ensure uid is set for security verification
                            tasks: newTemplates,
                            instances: newInstances
                        }, { merge: true });
                        
                        // Verify write succeeded by reading back
                        const verifySnap = await getDoc(doc(db, 'users', state.user.uid));
                        const verifyData = verifySnap.data();
                        if (import.meta.env.DEV) {
                            console.log("✅ Successfully stored in Firestore.", { 
                                written: { templateCount: newTemplates.length, instanceCount: newInstances.length },
                                verified: { templateCount: verifyData?.tasks?.length || 0, instanceCount: verifyData?.instances?.length || 0 }
                            });
                            
                            // Extra validation
                            if ((verifyData?.tasks?.length || 0) < newTemplates.length) {
                                console.warn("⚠️ WARNING: Not all templates were written to Firestore!");
                            }
                        }
                    } catch (error) {
                        console.error("❌ Firestore write failed:", error);
                        throw error; // Re-throw so UI knows the save failed
                    }
                } else {
                    if (import.meta.env.DEV) console.warn("⚠️ No user logged in, task only stored locally.");
                }
            },

            updateTask: async (id, updates) => {
                const state = get();
                // Determine if 'id' is an Instance ID or Template ID
                const instance = state.instances.find(i => i.id === id);
                const templateId = instance ? instance.taskId : id;

                const newTemplates = state.templates.map(t => t.id === templateId ? { ...t, ...updates } : t);

                // Update Local State
                set({ templates: newTemplates });

                if (state.user) {
                    if (import.meta.env.DEV) console.log("📡 Updating task in Firestore...");
                    try {
                        await setDoc(doc(db, 'users', state.user.uid), { tasks: newTemplates }, { merge: true });
                        if (import.meta.env.DEV) console.log("✅ Firestore update successful.");
                    } catch (error) {
                        console.error("❌ Firestore write failed:", error);
                        throw error;
                    }
                }
            },

            deleteTask: async (id) => {
                playSound('delete');
                const state = get();
                const instance = state.instances.find(i => i.id === id);
                const templateId = instance ? instance.taskId : id;
                const today = format(new Date(), 'yyyy-MM-dd');

                if (import.meta.env.DEV) console.log("🗑️ Deleting task:", templateId);

                // Soft delete: Mark template as archived
                const newTemplates = state.templates.map(t =>
                    t.id === templateId ? { ...t, archived: true } : t
                );

                // Remove only current and future instances. Keep the past (History/Yesterday).
                const newInstances = state.instances.filter(i =>
                    !(i.taskId === templateId && i.date >= today)
                );

                set({ templates: newTemplates, instances: newInstances });

                if (state.user) {
                    if (import.meta.env.DEV) console.log("📡 Deleting task from Firestore...");
                    try {
                        await setDoc(doc(db, 'users', state.user.uid), {
                            tasks: newTemplates,
                            instances: newInstances
                        }, { merge: true });
                        if (import.meta.env.DEV) console.log("✅ Firestore deletion successful.");
                    } catch (error) {
                        console.error("❌ Firestore write failed:", error);
                        throw error;
                    }
                }
            },

            toggleTask: async (id, date) => {
                const state = get();
                // id is likely an Instance ID now, or we fallback
                let instance = state.instances.find(i => i.id === id);
                const today = format(new Date(), 'yyyy-MM-dd');

                // Fallback for one-time tasks or mismatches
                if (!instance) {
                    // Try to find an instance for today for this taskId
                    instance = state.instances.find(i => i.taskId === id && i.date === (date || today));
                }

                if (!instance) return; // Cannot toggle non-existent instance

                const template = state.templates.find(t => t.id === instance!.taskId);
                if (!template) return; // Orphaned instance

                const isCompleting = instance.status !== 'completed';
                const now = new Date();
                const targetDate = instance.date;
                const isTargetToday = targetDate === today;

                const p = { ...state.profile };
                const newNotifications: Omit<Notification, 'id'>[] = [];

                const newInstances = state.instances.map(i => {
                    if (i.id === instance!.id) {
                        return {
                            ...i,
                            status: isCompleting ? 'completed' : 'pending',
                            completedAt: isCompleting ? now.toISOString() : null
                        } as TaskInstance;
                    }
                    return i;
                });

                if (isCompleting) {
                    p.xp += template.xpValue;
                    p.totalTasksCompleted += 1;

                    // Level Up Logic
                    while (p.xp >= p.xpToNextLevel) {
                        p.xp -= p.xpToNextLevel;
                        p.level += 1;
                        p.xpToNextLevel = Math.round(XP_PER_LEVEL * Math.pow(1.15, p.level - 1));
                        playSound('levelUp');
                        newNotifications.push({ type: 'level', title: 'Level Up!', message: `You've reached Level ${p.level}! 🎉`, icon: '🆙' });
                    }
                    if (newNotifications.length === 0) playSound('success');

                    // Streak Logic
                    const lastActive = p.lastActiveDate;
                    if (isTargetToday) {
                        const diff = differenceInDays(parseISO(targetDate), parseISO(lastActive));
                        if (diff === 1) p.currentStreak += 1; // Consecutive
                        else if (diff > 1) p.currentStreak = 1; // Broken
                        p.lastActiveDate = targetDate;
                    }
                    p.longestStreak = Math.max(p.longestStreak, p.currentStreak);

                    // Add Notification
                    newNotifications.push({ type: 'xp', title: `+${template.xpValue} XP`, message: `"${template.title}" completed`, icon: '✨' });

                    // Update History
                    const hist = [...state.completionHistory];
                    const rec = hist.find((r) => r.date === targetDate);
                    if (rec) {
                        rec.completed += 1;
                        rec.xpEarned += template.xpValue;
                    } else {
                        hist.push({ date: targetDate, completed: 1, total: 1, xpEarned: template.xpValue });
                    }

                    set({ instances: newInstances, profile: p, notifications: [...state.notifications, ...newNotifications.map(n => ({ ...n, id: generateId() }))], completionHistory: hist });
                } else {
                    playSound('click');
                    p.xp = Math.max(0, p.xp - template.xpValue);
                    p.totalTasksCompleted = Math.max(0, p.totalTasksCompleted - 1);
                    set({ instances: newInstances, profile: p });
                }

                if (state.user) {
                    if (import.meta.env.DEV) console.log("📡 Toggling task in Firestore...");
                    try {
                        await setDoc(doc(db, 'users', state.user.uid), { instances: newInstances, profile: p }, { merge: true });
                        if (import.meta.env.DEV) console.log("✅ Firestore toggle successful.");
                    } catch (error) {
                        console.error("❌ Firestore write failed:", error);
                        throw error;
                    }
                }
            },

            toggleSubtask: async (taskId, subtaskId) => {
                const state = get();
                const instance = state.instances.find(i => i.id === taskId);
                const templateId = instance ? instance.taskId : taskId;

                const newTemplates = state.templates.map((t) =>
                    t.id === templateId
                        ? {
                            ...t,
                            subtasks: t.subtasks.map((st) =>
                                st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
                            )
                        }
                        : t
                );
                set({ templates: newTemplates });

                if (state.user) {
                    if (import.meta.env.DEV) console.log("📡 Updating subtask in Firestore...");
                    try {
                        await setDoc(doc(db, 'users', state.user.uid), { tasks: newTemplates }, { merge: true });
                        if (import.meta.env.DEV) console.log("✅ Firestore subtask update successful.");
                    } catch (error) {
                        console.error("❌ Firestore write failed:", error);
                        throw error;
                    }
                }
            },

            openTaskModal: (task) => set({ isTaskModalOpen: true, editingTask: task || null }),
            closeTaskModal: () => set({ isTaskModalOpen: false, editingTask: null }),
            dismissCelebration: () => set({ showCelebration: false }),

            addNotification: (n) => set((s) => ({ notifications: [...s.notifications, { ...n, id: generateId() }] })),
            removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),

            getFilteredTasks: () => {
                const tasks = get().getTodaysTasks();
                const { filter } = get();

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

            getTodaysTasks: () => {
                const state = get();
                const today = format(new Date(), 'yyyy-MM-dd');

                const todaysInstances = state.instances.filter(i => i.date === today);

                return todaysInstances.map(i => {
                    const tmpl = state.templates.find(t => t.id === i.taskId && !t.archived);
                    if (!tmpl) return null;
                    return {
                        ...tmpl,
                        id: i.id,
                        isCompleted: i.status === 'completed',
                        completedAt: i.completedAt,
                        dueDate: i.date,
                        postponedCount: 0,
                        completionHistory: {}
                    } as Task;
                }).filter(Boolean) as Task[];
            },

            getYesterdayTasks: () => {
                const state = get();
                const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
                const instances = state.instances.filter(i => i.date === yesterday);

                return instances.map(i => {
                    const tmpl = state.templates.find(t => t.id === i.taskId);
                    if (!tmpl) return null;
                    return {
                        ...tmpl,
                        id: i.id,
                        isCompleted: i.status === 'completed',
                        completedAt: i.completedAt,
                        dueDate: i.date,
                        postponedCount: 0,
                        completionHistory: {}
                    } as Task;
                }).filter(Boolean) as Task[];
            },

            getStagnantTasks: () => [],
            getMonthlyTasks: () => {
                const state = get();
                const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
                const monthlyInstances = state.instances.filter(i => i.date === monthStart);

                return monthlyInstances.map(i => {
                    const tmpl = state.templates.find(t => t.id === i.taskId && !t.archived);
                    if (!tmpl || tmpl.horizon !== 'monthly') return null;
                    return {
                        ...tmpl,
                        id: i.id, // Use instance ID for toggling
                        isCompleted: i.status === 'completed',
                        completedAt: i.completedAt,
                        dueDate: i.date,
                        postponedCount: 0,
                        completionHistory: {}
                    } as Task;
                }).filter(Boolean) as Task[];
            },

            getYearlyTasks: () => {
                const state = get();
                const yearStart = format(startOfYear(new Date()), 'yyyy-MM-dd');
                const yearlyInstances = state.instances.filter(i => i.date === yearStart);

                return yearlyInstances.map(i => {
                    const tmpl = state.templates.find(t => t.id === i.taskId && !t.archived);
                    if (!tmpl || tmpl.horizon !== 'yearly') return null;
                    return {
                        ...tmpl,
                        id: i.id,
                        isCompleted: i.status === 'completed',
                        completedAt: i.completedAt,
                        dueDate: i.date,
                        postponedCount: 0,
                        completionHistory: {}
                    } as Task;
                }).filter(Boolean) as Task[];
            },

            getCompletionRate: (horizon) => {
                const { instances, templates } = get();
                if (instances.length === 0) return 0;

                let filteredInstances = instances;
                if (horizon) {
                    const templateIds = templates.filter(t => t.horizon === horizon).map(t => t.id);
                    filteredInstances = instances.filter(i => templateIds.includes(i.taskId));
                }

                if (filteredInstances.length === 0) return 0;
                return Math.round((filteredInstances.filter(i => i.status === 'completed').length / filteredInstances.length) * 100);
            },

            getStreak: () => get().profile.currentStreak,

            getTodaysFocus: () => {
                const tasks = get().getTodaysTasks().filter(t => !t.isCompleted);
                if (!tasks.length) return null;
                const po: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                tasks.sort((a, b) => { const d = po[a.priority] - po[b.priority]; if (d !== 0) return d; return 0; });
                return tasks[0];
            },

            getCategoryStats: () => {
                const { instances, templates } = get();
                const completedInstances = instances.filter(i => i.status === 'completed');
                const allCats = [...new Set(templates.map(t => t.category).filter(Boolean))];
                return allCats.map(c => {
                    const tmplIds = templates.filter(t => t.category === c).map(t => t.id);
                    const total = instances.filter(i => tmplIds.includes(i.taskId)).length;
                    const completed = completedInstances.filter(i => tmplIds.includes(i.taskId)).length;
                    return { category: c, completed, total };
                });
            },

            getWeeklyCompletionData: () => {
                const { instances } = get();
                const start = startOfWeek(new Date());
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                return days.map((dayLabel, i) => {
                    const date = addDays(start, i);
                    const dateStr = format(date, 'yyyy-MM-dd');

                    const daysInstances = instances.filter(inst => inst.date === dateStr);
                    const completed = daysInstances.filter(inst => inst.status === 'completed').length;

                    return { day: dayLabel, completed, total: daysInstances.length };
                });
            },

            getMonthlyCompletionData: () => {
                const { instances } = get();
                const today = new Date();
                const result = [];
                // Last 30 days
                for (let i = 29; i >= 0; i--) {
                    const date = subDays(today, i);
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const dayLabel = format(date, 'MMM dd');
                    const daysInstances = instances.filter(inst => inst.date === dateStr);
                    const completed = daysInstances.filter(inst => inst.status === 'completed').length;
                    result.push({ day: dayLabel, completed, total: daysInstances.length });
                }
                return result;
            },

            getWeeklyHistory: () => {
                const { instances } = get();
                if (instances.length === 0) return [];

                // 1. Filter only daily/one-time instances and group by week start (Monday)
                const { templates } = get();
                const weekGroups: Record<string, TaskInstance[]> = {};

                instances.forEach(inst => {
                    const tmpl = templates.find(t => t.id === inst.taskId);
                    if (!tmpl || tmpl.horizon === 'monthly' || tmpl.horizon === 'yearly') return;

                    const instDate = parseISO(inst.date);
                    const weekStart = format(startOfWeek(instDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
                    if (!weekGroups[weekStart]) weekGroups[weekStart] = [];
                    weekGroups[weekStart].push(inst);
                });

                // 2. Process each week
                const history = Object.keys(weekGroups).map(weekStartStr => {
                    const weekStart = parseISO(weekStartStr);
                    const weekInstances = weekGroups[weekStartStr];

                    const completedTasks = weekInstances.filter(i => i.status === 'completed').length;
                    const totalTasks = weekInstances.length;
                    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    // Daily breakdown for MON-SUN
                    // MON=1, ..., SUN=0 in date-fns usually, but let's be explicit
                    const dailyBreakdown = [1, 2, 3, 4, 5, 6, 0].map(dayIndex => {
                        // Offset from weekStart (Monday)
                        // Monday offset = 0, Tuesday = 1, ..., Sunday = 6
                        const offset = (dayIndex === 0 ? 6 : dayIndex - 1);
                        const date = addDays(weekStart, offset);
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const dayLabel = format(date, 'EEE').toUpperCase();

                        const dayInsts = weekInstances.filter(i => i.date === dateStr);
                        const dayCompleted = dayInsts.filter(i => i.status === 'completed').length;
                        const dayTotal = dayInsts.length;

                        return {
                            date: dateStr,
                            label: dayLabel,
                            completed: dayCompleted,
                            total: dayTotal,
                            ratio: dayTotal > 0 ? dayCompleted / dayTotal : 0
                        };
                    });

                    const weekEnd = addDays(weekStart, 6);
                    const weekLabel = `Week ${format(weekStart, 'w')} (${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}) ${format(weekEnd, 'yyyy')}`;

                    const weekJournals = get().journalEntries.filter(j => {
                        const jDate = parseISO(j.date);
                        return jDate >= weekStart && jDate <= weekEnd;
                    });
                    const journalConsistency = Math.round((weekJournals.length / 7) * 100);

                    return {
                        weekStart: weekStartStr,
                        weekLabel,
                        totalTasks,
                        completedTasks,
                        progressPercentage,
                        dailyBreakdown,
                        journalConsistency
                    };
                });

                // 3. Sort descending
                return history.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
            },
            getProductivityScore: () => {
                const state = get();
                const today = format(new Date(), 'yyyy-MM-dd');

                // 1. Daily Progress (50%)
                const todayTasks = state.getTodaysTasks();
                const totalToday = todayTasks.length;
                const completedToday = todayTasks.filter(t => t.isCompleted).length;
                const dailyRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

                // 2. Consistency / Streak (30%)
                const streak = state.profile.currentStreak;
                const streakScore = Math.min(streak * 3, 30); // Cap at 10 days for max streak score

                // 3. Momentum / XP (20%)
                const history = state.completionHistory.find(h => h.date === today);
                const xpToday = history ? history.xpEarned : 0;
                const momentumScore = Math.min(xpToday / 20, 20); // 400 XP = max momentum

                // 4. Penalties & Bonuses
                const stagnant = state.tasks.filter(t => !t.isCompleted && (t.daysPending || 0) >= 3).length;
                const penalty = stagnant * 5;

                const rawScore = (dailyRate * 0.5) + streakScore + momentumScore - penalty;
                return Math.max(0, Math.min(100, Math.round(rawScore)));
            },

            addJournalEntry: async (entryData) => {
                const { user, profile, journalEntries } = get();
                if (!user) return;

                const entryDate = entryData.date || format(new Date(), 'yyyy-MM-dd');
                const weekNumber = getWeek(parseISO(entryDate), { weekStartsOn: 1 });
                const docId = `${user.uid}_${entryDate}`;

                // Calculate streak bonus
                const streakCount = getJournalStreak(journalEntries);
                let bonus = 0;
                if (streakCount + 1 >= 7) bonus = 50;
                else if (streakCount + 1 >= 3) bonus = 10;

                const xpEarned = 20 + bonus;

                const newEntry = {
                    ...entryData,
                    userId: user.uid,
                    date: entryDate,
                    weekNumber,
                    xpEarned,
                    createdAt: new Date().toISOString(),
                    updatedAt: serverTimestamp()
                };

                await setDoc(doc(db, 'journal_entries', docId), newEntry, { merge: true });
                const finalEntry = { ...newEntry, id: docId } as JournalEntry;

                // Update Profile XP
                const newTotalXP = profile.xp + xpEarned;
                const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1;
                const newProfile = {
                    ...profile,
                    xp: newTotalXP,
                    level: newLevel,
                };

                set({
                    journalEntries: [finalEntry, ...journalEntries.filter(j => j.id !== docId)],
                    profile: newProfile,
                    showCelebration: true,
                    lastCelebrationXP: xpEarned
                });

                // Sync profile
                await setDoc(doc(db, 'users', user.uid), { profile: newProfile }, { merge: true });
                playSound('success');
            },

            updateJournalEntry: async (id, updates) => {
                const { user, journalEntries } = get();
                if (!user) return;

                const journalRef = doc(db, 'journal_entries', id);
                const updateData = {
                    ...updates,
                    updatedAt: serverTimestamp()
                };
                await setDoc(journalRef, updateData, { merge: true });

                set({
                    journalEntries: journalEntries.map(j => j.id === id ? { ...j, ...updates } : j)
                });
            },

            deleteJournalEntry: async (id: string) => {
                const { journalEntries } = get();
                try {
                    await deleteDoc(doc(db, 'journal_entries', id));
                    set({
                        journalEntries: journalEntries.filter(j => j.id !== id)
                    });
                } catch (error) {
                    console.error("Error deleting journal entry:", error);
                }
            },

            fetchJournalEntries: async () => {
                const { user } = get();
                if (!user) return;

                try {
                    const q = query(
                        collection(db, 'journal_entries'),
                        where('userId', '==', user.uid),
                        orderBy('date', 'desc')
                    );

                    const snap = await getDocs(q);
                    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() } as JournalEntry));

                    // Deduplicate by date (keep latest one if multiple exist)
                    const uniqueEntries: JournalEntry[] = [];
                    const seenDates = new Set();
                    entries.forEach(e => {
                        if (!seenDates.has(e.date)) {
                            uniqueEntries.push(e);
                            seenDates.add(e.date);
                        }
                    });

                    set({ journalEntries: uniqueEntries.slice(0, 60) });
                } catch (error) {
                    console.warn("Index not ready or query error, falling back to local sort", error);
                    const qBasic = query(
                        collection(db, 'journal_entries'),
                        where('userId', '==', user.uid)
                    );
                    const snap = await getDocs(qBasic);
                    const entries = snap.docs
                        .map(d => ({ id: d.id, ...d.data() } as JournalEntry))
                        .filter(e => e.date) // Ensure date exists
                        .sort((a, b) => {
                            // Sort by date desc, then by createdAt desc for same date
                            if (b.date !== a.date) return b.date.localeCompare(a.date);
                            return (b.createdAt || '').localeCompare(a.createdAt || '');
                        });

                    const uniqueEntries: JournalEntry[] = [];
                    const seenDates = new Set();
                    entries.forEach(e => {
                        if (!seenDates.has(e.date)) {
                            uniqueEntries.push(e);
                            seenDates.add(e.date);
                        }
                    });

                    set({ journalEntries: uniqueEntries.slice(0, 60) });
                }
            },

            fetchConversations: async () => {
                const { user } = get();
                if (!user) return;
                try {
                    const q = query(
                        collection(db, 'ai_conversations'),
                        where('userId', '==', user.uid),
                        orderBy('lastMessageAt', 'desc')
                    );
                    const snap = await getDocs(q);
                    const convs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AIConversation));
                    set({ conversations: convs });

                    if (get().activeConversationId) {
                        await get().fetchMessages(get().activeConversationId!);
                    }
                } catch (e) {
                    console.error("Error fetching conversations:", e);
                    const qBasic = query(collection(db, 'ai_conversations'), where('userId', '==', user.uid));
                    const snap = await getDocs(qBasic);
                    const convs = snap.docs
                        .map(d => ({ id: d.id, ...d.data() } as AIConversation))
                        .sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));
                    set({ conversations: convs });
                }
            },

            fetchMessages: async (conversationId) => {
                try {
                    const q = query(
                        collection(db, 'ai_conversations', conversationId, 'messages'),
                        orderBy('createdAt', 'asc')
                    );
                    const snap = await getDocs(q);
                    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AIChatMessage));
                    set({ activeConversationMessages: msgs });
                } catch (e) {
                    console.error("Error fetching messages:", e);
                    const qBasic = query(collection(db, 'ai_conversations', conversationId, 'messages'));
                    const snap = await getDocs(qBasic);
                    const msgs = snap.docs
                        .map(d => ({ id: d.id, ...d.data() } as AIChatMessage))
                        .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
                    set({ activeConversationMessages: msgs });
                }
            },

            setActiveConversation: (id) => {
                set({ activeConversationId: id });
                if (id) {
                    get().fetchMessages(id);
                } else {
                    set({ activeConversationMessages: [] });
                }
            },

            sendAssistantMessage: async (userMsg, context) => {
                const { user, activeConversationId, conversations, activeConversationMessages } = get();
                if (!user) return;

                let convId = activeConversationId;
                const now = new Date().toISOString();

                try {
                    if (!convId) {
                        const newConv: Omit<AIConversation, 'id'> = {
                            userId: user.uid,
                            createdAt: now,
                            lastMessageAt: now,
                            title: userMsg.slice(0, 40) + (userMsg.length > 40 ? '...' : '')
                        };
                        const convRef = await addDoc(collection(db, 'ai_conversations'), newConv);
                        convId = convRef.id;
                        set({
                            activeConversationId: convId,
                            conversations: [{ id: convId, ...newConv } as AIConversation, ...conversations]
                        });
                    }

                    const userMessageData: Omit<AIChatMessage, 'id'> = {
                        role: 'user',
                        content: userMsg,
                        createdAt: now
                    };
                    const userMsgRef = await addDoc(collection(db, 'ai_conversations', convId, 'messages'), userMessageData);
                    const userMsgObj = { id: userMsgRef.id, ...userMessageData } as AIChatMessage;

                    set({ activeConversationMessages: [...activeConversationMessages, userMsgObj] });

                    const data = await generateAIResponse(userMsg, context, user.uid);
                    if (!data) throw new Error("No response from AI");

                    const assistantMessageData: Omit<AIChatMessage, 'id'> = {
                        role: 'assistant',
                        content: data.reflection + '\n\n' + data.focusAdvice,
                        suggestedTasks: data.suggestedTasks,
                        createdAt: new Date().toISOString()
                    };
                    const assistantMsgRef = await addDoc(collection(db, 'ai_conversations', convId, 'messages'), assistantMessageData);
                    const assistantMsgObj = { id: assistantMsgRef.id, ...assistantMessageData } as AIChatMessage;

                    await setDoc(doc(db, 'ai_conversations', convId), {
                        lastMessageAt: assistantMessageData.createdAt
                    }, { merge: true });

                    set({
                        activeConversationMessages: [...get().activeConversationMessages, assistantMsgObj],
                        conversations: get().conversations.map(c => c.id === convId ? { ...c, lastMessageAt: assistantMessageData.createdAt } : c)
                    });

                } catch (error: any) {
                    console.error("AI Chat Error:", error);
                    get().addNotification({
                        title: 'A.I. Error',
                        message: error.message || "Failed to get AI response.",
                        type: 'info',
                        icon: '🤖'
                    });
                    throw error;
                }
            },

            clearConversation: async (id) => {
                const { conversations, activeConversationId } = get();
                try {
                    const msgsSnap = await getDocs(collection(db, 'ai_conversations', id, 'messages'));
                    const batch = writeBatch(db);
                    msgsSnap.docs.forEach(d => batch.delete(d.ref));
                    batch.delete(doc(db, 'ai_conversations', id));
                    await batch.commit();

                    set({
                        conversations: conversations.filter(c => c.id !== id),
                        activeConversationId: activeConversationId === id ? null : activeConversationId,
                        activeConversationMessages: activeConversationId === id ? [] : get().activeConversationMessages
                    });
                } catch (e) {
                    console.error("Error clearing conversation:", e);
                }
            },
        }),
        {
            name: 'todo-app-storage',
            version: 2,
            partialize: (state) => ({
                // ⚠️ IMPORTANT: Do NOT persist templates/instances to localStorage
                // Firestore is the single source of truth
                // These MUST be fetched fresh on every setUser() call
                profile: state.profile,
                completionHistory: state.completionHistory,
                currentView: state.currentView,
            }),
        }
    )
);
