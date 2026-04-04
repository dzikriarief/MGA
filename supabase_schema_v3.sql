-- ================================================================
-- Muslim Growth Academy — Schema Migration v3
-- Content Planner draft columns
-- ================================================================

ALTER TABLE public.content_planner
  ADD COLUMN IF NOT EXISTS hook TEXT,
  ADD COLUMN IF NOT EXISTS foreshadow TEXT,
  ADD COLUMN IF NOT EXISTS body TEXT,
  ADD COLUMN IF NOT EXISTS cta TEXT,
  ADD COLUMN IF NOT EXISTS caption TEXT,
  ADD COLUMN IF NOT EXISTS script TEXT;

-- Add brand_message to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS brand_message TEXT,
  ADD COLUMN IF NOT EXISTS elevator_pitch TEXT,
  ADD COLUMN IF NOT EXISTS final_pillars JSONB DEFAULT '[]'::jsonb;
