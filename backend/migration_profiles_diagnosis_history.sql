-- ============================================================
-- AI Crop Doctor - Complete Supabase SQL Setup & Fixes
-- Copy and run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================

-- 1. Fix profiles table defaults
ALTER TABLE public.profiles 
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN full_name SET DEFAULT '';

-- 2. Make user_id optional in diagnosis_history for flexible inserts
ALTER TABLE public.diagnosis_history 
  ALTER COLUMN user_id DROP NOT NULL;

-- 3. Enable Row Level Security (RLS) & Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for profiles" ON public.profiles;
CREATE POLICY "Allow select for profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for profiles" ON public.profiles;
CREATE POLICY "Allow insert for profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for profiles" ON public.profiles;
CREATE POLICY "Allow update for profiles" ON public.profiles FOR UPDATE USING (true);

-- 4. Enable Row Level Security (RLS) & Policies for diagnosis_history
ALTER TABLE public.diagnosis_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for diagnosis_history" ON public.diagnosis_history;
CREATE POLICY "Allow select for diagnosis_history" ON public.diagnosis_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert for diagnosis_history" ON public.diagnosis_history;
CREATE POLICY "Allow insert for diagnosis_history" ON public.diagnosis_history FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for diagnosis_history" ON public.diagnosis_history;
CREATE POLICY "Allow delete for diagnosis_history" ON public.diagnosis_history FOR DELETE USING (true);
