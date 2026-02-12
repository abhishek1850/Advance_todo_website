-- Enable Row Level Security (RLS)
-- (Users should strictly only see and modify their own data)

-- =====================================================================================
-- 1. Profiles Table (Stores user stats like XP, Level, Streak)
--    Note: Since we use Firebase for Auth, we trust the 'user_id' sent from the client
--    but we should ideally verify the Firebase token on the server side.
--    However, for a simple client-side integration without a backend,
--    we can rely on RLS policies where user_id matches the authenticated user ID.
--    Wait, Supabase Auth is NOT generating the user ID here. Firebase is.
--    So 'auth.uid()' in Supabase won't work directly if we don't enable Custom Auth.
--    
--    CRITICAL DECISION:
--    Since we switched to Firebase Auth, Supabase doesn't essentially know "who" the user is
--    unless we mint a custom JWT for Supabase or just treat the DB as a standard REST API 
--    where we pass the user_id as a field.
--    But disabling RLS is insecure.
--
--    Alternative (Easiest for this hybrid setup):
--    We can keep using Supabase Storage (which is working) but for DATA (Postgres),
--    it might be better to just use FIRESTORE (Firebase Database) since we are already
--    using Firebase Auth. It integrates seamlessly.
--
--    Using Firebase Auth + Supabase DB is complicated because Supabase RLS relies on Supabase Auth.
--    
--    RE-EVALUATING:
--    The user asked "use supabase for data storage".
--    If I do this, I have to handle the "Foreign Auth" problem.
--    
--    SIMPLEST PATH forward that fulfills "Firebase Auth + Supabase Data":
--    - Ideally, we should stick to ONE ecosystem (Firebase Auth + Firestore) OR (Supabase Auth + Supabase DB).
--    - Mixing them means we lose RLS protection in Supabase unless we do complex JWT minting.
--
--    HOWEVER, if the user insists on this hybrid:
--    We create a table where `user_id` is a text column.
--    But without Supabase Auth, `auth.uid()` is null.
--    We would have to make the table "public" (bad security) or set up a proxy.
--
--    RECOMMENDATION:
--    I will switch to **FIRESTORE** (Firebase's DB) instead. 
--    It is "Database" and it works instantly with the `user` object we already have.
--    
--    But the user EXPLICITLY asked "use supabase for data storage".
--    
--    So I will assume they might swap Auth later or just want the Postgres power.
--    To make this work securely, we would need to pass a Supabase-signed JWT.
--    
--    FOR NOW (To answer "Does it have a database?"):
--    I will provide the Schema for Supabase, but warn about the Auth mismatch.
--    Actually, maybe the user *doesn't* know that Firebase Auth doesn't talk to Supabase DB automatically.
--    
--    Let's produce the SQL schema assuming we might resolve the auth link later, 
--    OR (better) suggest using Firestore since we already have Firebase.
--    
--    But I must follow instructions: "use supabase for data storage".
--    
--    So, here is the SQL. We will use a `user_id` text column.
--    SECURITY WARNING: Without Supabase Auth, we can't restrict rows easily via RLS 
--    unless we use the Supabase Client anonymously and trust the client filter (insecure) 
--    or set up a custom claims system.
-- =====================================================================================

create table public.tasks (
  id text primary key,
  user_id text not null, -- Stores Firebase UID
  title text not null,
  description text,
  horizon text check (horizon in ('daily', 'monthly', 'yearly')),
  priority text check (priority in ('low', 'medium', 'high', 'critical')),
  category text,
  due_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  is_completed boolean default false,
  recurrence text,
  energy_level text,
  estimated_minutes integer,
  xp_value integer,
  tags text[],
  subtasks jsonb, -- Storing subtasks as JSON for simplicity
  postponed_count integer default 0
);

create table public.profiles (
  user_id text primary key, -- Firebase UID
  name text,
  level integer default 1,
  xp integer default 0,
  xp_to_next_level integer default 500,
  total_tasks_completed integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active_date date,
  joined_date date default now(),
  badges jsonb,
  daily_challenge jsonb,
  preferences jsonb
);

-- Enable RLS
alter table public.tasks enable row level security;
alter table public.profiles enable row level security;

-- Policies (NOTE: These won't work correctly with Firebase Auth plain client!)
-- We need to technically allow anon access BUT filter by the user_id passed in the query.
-- OR correct approach: Use Firestore.

-- For now, letting 'anon' insert/select but strictly this is insecure without a bridge.
create policy "Allow public access for demo" on public.tasks for all using (true);
create policy "Allow public access for demo" on public.profiles for all using (true);
