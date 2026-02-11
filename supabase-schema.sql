-- ============================================
-- TaskFlow Database Schema for Supabase
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  horizon TEXT DEFAULT 'daily' CHECK (horizon IN ('daily', 'monthly', 'yearly')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  energy_level TEXT DEFAULT 'medium' CHECK (energy_level IN ('low', 'medium', 'high')),
  estimated_minutes INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  due_date TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  subtasks JSONB DEFAULT '[]',
  xp_value INT DEFAULT 20,
  postponed_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (gamification data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'User',
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  xp_to_next_level INT DEFAULT 500,
  total_tasks_completed INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date TEXT,
  joined_date TEXT,
  badges JSONB DEFAULT '[]',
  daily_challenge JSONB,
  preferences JSONB DEFAULT '{"theme":"dark","celebrationsEnabled":true,"soundEnabled":true,"defaultHorizon":"daily","defaultPriority":"medium"}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Completion history
CREATE TABLE IF NOT EXISTS completion_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  completed INT DEFAULT 0,
  total INT DEFAULT 0,
  xp_earned INT DEFAULT 0
);

-- Create unique constraint for completion_history per user per date
CREATE UNIQUE INDEX IF NOT EXISTS completion_history_user_date ON completion_history(user_id, date);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE completion_history ENABLE ROW LEVEL SECURITY;

-- Tasks: users can only access their own
CREATE POLICY "Users can CRUD own tasks" ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Profiles: users can only access their own
CREATE POLICY "Users can CRUD own profile" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Completion history: users can only access their own
CREATE POLICY "Users can CRUD own history" ON completion_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, joined_date, last_active_date, badges, daily_challenge, preferences)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    TO_CHAR(NOW(), 'YYYY-MM-DD'),
    TO_CHAR(NOW(), 'YYYY-MM-DD'),
    '[{"id":"first_task","name":"First Step","description":"Complete your first task","icon":"🎯","unlockedAt":null,"requirement":"Complete 1 task","category":"milestone"},{"id":"streak_7","name":"Week Warrior","description":"7-day streak","icon":"🔥","unlockedAt":null,"requirement":"7-day streak","category":"streak"},{"id":"streak_30","name":"Monthly Master","description":"30-day streak","icon":"⚡","unlockedAt":null,"requirement":"30-day streak","category":"streak"},{"id":"streak_100","name":"Centurion","description":"100-day streak","icon":"👑","unlockedAt":null,"requirement":"100-day streak","category":"streak"},{"id":"tasks_10","name":"Getting Started","description":"Complete 10 tasks","icon":"📋","unlockedAt":null,"requirement":"10 tasks","category":"completion"},{"id":"tasks_50","name":"Productive","description":"Complete 50 tasks","icon":"🚀","unlockedAt":null,"requirement":"50 tasks","category":"completion"},{"id":"tasks_100","name":"Century Club","description":"Complete 100 tasks","icon":"💯","unlockedAt":null,"requirement":"100 tasks","category":"completion"},{"id":"tasks_500","name":"Task Legend","description":"Complete 500 tasks","icon":"🏆","unlockedAt":null,"requirement":"500 tasks","category":"completion"},{"id":"level_5","name":"Rising Star","description":"Reach level 5","icon":"⭐","unlockedAt":null,"requirement":"Level 5","category":"milestone"},{"id":"level_10","name":"Veteran","description":"Reach level 10","icon":"🌟","unlockedAt":null,"requirement":"Level 10","category":"milestone"},{"id":"all_horizons","name":"Full Spectrum","description":"Tasks in all 3 horizons","icon":"🌈","unlockedAt":null,"requirement":"All horizons","category":"special"},{"id":"early_bird","name":"Early Bird","description":"5 tasks before noon","icon":"🌅","unlockedAt":null,"requirement":"Early completions","category":"special"}]'::JSONB,
    NULL,
    '{"theme":"dark","celebrationsEnabled":true,"soundEnabled":true,"defaultHorizon":"daily","defaultPriority":"medium"}'::JSONB
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
