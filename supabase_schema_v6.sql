-- ================================================================
-- Muslim Growth Academy — Schema Migration v6
-- Multi-platform support for Content Planner
-- ================================================================

ALTER TABLE public.content_planner
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'Instagram';
