export type TaskHorizon = 'daily' | 'monthly' | 'yearly';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type RecurrencePattern = 'none' | 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Task {
  id: string;
  title: string;
  description: string;
  horizon: TaskHorizon;
  priority: TaskPriority;
  category: string;
  dueDate: string;
  createdAt: string;
  completedAt: string | null;
  isCompleted: boolean;
  recurrence: RecurrencePattern;
  energyLevel: EnergyLevel;
  estimatedMinutes: number;
  tags: string[];
  xpValue: number;
  subtasks: Subtask[];
  postponedCount: number;
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
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  celebrationsEnabled: boolean;
  soundEnabled: boolean;
  defaultHorizon: TaskHorizon;
  defaultPriority: TaskPriority;
}

export interface CompletionRecord {
  date: string;
  completed: number;
  total: number;
  xpEarned: number;
}

export type ViewType = 'dashboard' | 'today' | 'monthly' | 'yearly' | 'analytics' | 'achievements' | 'profile';

export interface TaskFilter {
  horizon?: TaskHorizon;
  priority?: TaskPriority;
  category?: string;
  energyLevel?: EnergyLevel;
  isCompleted?: boolean;
  search?: string;
}
