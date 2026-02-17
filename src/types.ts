export type TaskHorizon = 'daily' | 'monthly' | 'yearly';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type RecurrencePattern = 'none' | 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface TaskTemplate {
  id: string;
  userId?: string;
  title: string;
  description: string;
  type: 'daily' | 'monthly' | 'yearly' | 'one-time';
  horizon: TaskHorizon;
  priority: TaskPriority;
  category: string;
  recurrence: RecurrencePattern;
  createdAt: string;
  energyLevel: EnergyLevel;
  estimatedMinutes: number;
  tags: string[];
  xpValue: number;
  subtasks: Subtask[]; // Templates for subtasks
  archived?: boolean;
}

export interface TaskInstance {
  id: string; // Unique ID (e.g., templateId_date)
  taskId: string; // Reference to TaskTemplate.id
  userId?: string;
  date: string; // YYYY-MM-DD
  status: 'pending' | 'completed' | 'missed';
  completedAt: string | null;
  xpEarned?: number;
}

// Hydrated Task for UI (Combines Template + Instance)
export interface Task extends TaskTemplate {
  isCompleted: boolean; // Computed from instance status
  dueDate: string; // Computed from instance date or template rule
  completedAt: string | null; // From instance
  daysPending?: number; // Computed
  isRolledOver?: boolean; // Computed
  completionHistory?: Record<string, boolean>; // Deprecated but kept for compatibility
  postponedCount: number; // Kept for one-time tasks or specific instance logic
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  requirement: string;
  category: 'streak' | 'completion' | 'special' | 'milestone';
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
  date: string;
  type: 'complete_n' | 'streak' | 'category' | 'time_based';
  target: number;
  progress: number;
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalTasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  joinedDate: string;
  badges: Badge[];
  dailyChallenge: DailyChallenge | null;
  preferences: UserPreferences;
  onboardingComplete: boolean;
  username?: string;
  totalXP?: number; // Total XP earned over time (for stats)
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  celebrationsEnabled: boolean;
  soundEnabled: boolean;
  defaultHorizon: TaskHorizon;
  defaultPriority: TaskPriority;
  accentColor?: string;
  autoRollover?: boolean;
  rolloverMultiplier?: boolean;
}

export interface CompletionRecord {
  date: string;
  completed: number;
  total: number;
  xpEarned: number;
}

export interface AIChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  suggestedTasks?: any[];
}

export interface AIConversation {
  id: string;
  userId: string;
  createdAt: string;
  lastMessageAt: string;
  title?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // yyyy-mm-dd format
  weekNumber: number;
  wins: string;
  learn: string;
  mistakes: string;
  tomorrowIntent: string;
  mood?: 'great' | 'good' | 'okay' | 'tired' | 'frustrated';
  xpGain: number;
  streakBonus: number;
  createdAt: string;
  updatedAt?: string;
}

export type ViewType = 'dashboard' | 'today' | 'yesterday' | 'history' | 'journal' | 'monthly' | 'yearly' | 'analytics' | 'achievements' | 'profile' | 'assistant' | 'focus';

export interface TaskFilter {
  horizon?: TaskHorizon;
  priority?: TaskPriority;
  category?: string;
  energyLevel?: EnergyLevel;
  isCompleted?: boolean;
  search?: string;
}
