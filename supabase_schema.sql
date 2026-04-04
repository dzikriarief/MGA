-- ================================================================
-- Personal Brand Builder — Supabase SQL Schema
-- Run this in your Supabase project: SQL Editor > New Query
-- ================================================================

-- 1. user_profiles table
-- Automatically created for every new auth user via trigger below.
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id               UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email            TEXT,
  niche            TEXT,
  keahlian         TEXT,
  hal_disukai      TEXT,
  masalah_audiens  TEXT,
  tone_of_voice    TEXT DEFAULT 'Casual',
  kelebihan        TEXT,
  kelemahan        TEXT,
  saved_bio        TEXT,
  content_pillars  JSONB DEFAULT '[]'::jsonb,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own profile" ON public.user_profiles;
CREATE POLICY "Users manage their own profile"
  ON public.user_profiles
  FOR ALL
  USING (auth.uid() = id);

-- Trigger: auto-create profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();


-- 2. content_planner table
CREATE TABLE IF NOT EXISTS public.content_planner (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  judul       TEXT NOT NULL,
  pilar       TEXT,
  status      TEXT DEFAULT 'Idea' CHECK (status IN ('Idea', 'Scripting', 'Ready', 'Done')),
  deadline    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security for content_planner
ALTER TABLE public.content_planner ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own content" ON public.content_planner;
CREATE POLICY "Users manage their own content"
  ON public.content_planner
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_content_planner_user_id
  ON public.content_planner(user_id);
