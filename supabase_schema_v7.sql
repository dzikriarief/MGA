-- ================================================================
-- Muslim Growth Academy — Schema Migration v7
-- Enhanced Competitors, Content Funnel, User Story
-- ================================================================

-- 1. Enhanced Competitors table
ALTER TABLE public.competitors
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'Lokal' CHECK (scope IN ('Lokal', 'Global')),
  ADD COLUMN IF NOT EXISTS niche_relevance TEXT DEFAULT 'Satu Niche' CHECK (niche_relevance IN ('Satu Niche', 'Masih Berhubungan', 'Beda Niche')),
  ADD COLUMN IF NOT EXISTS ticket_level TEXT DEFAULT 'Low Ticket' CHECK (ticket_level IN ('Low Ticket', 'High Ticket', 'Keduanya')),
  ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '[]'::jsonb;

-- 2. Content Planner funnel
ALTER TABLE public.content_planner
  ADD COLUMN IF NOT EXISTS funnel TEXT DEFAULT 'TOFU' CHECK (funnel IN ('TOFU', 'MOFU', 'BOFU'));

-- 3. User story field for persona
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS personal_story TEXT;
