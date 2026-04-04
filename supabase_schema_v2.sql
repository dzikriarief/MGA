-- ================================================================
-- Muslim Growth OS — Schema Migration v2
-- Run this in Supabase SQL Editor AFTER the initial schema
-- ================================================================

-- Add new columns to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS business_opportunity TEXT,
  ADD COLUMN IF NOT EXISTS market_size TEXT,
  ADD COLUMN IF NOT EXISTS niche_final TEXT,
  ADD COLUMN IF NOT EXISTS niche_reason TEXT,
  ADD COLUMN IF NOT EXISTS target_audience TEXT,
  ADD COLUMN IF NOT EXISTS offers JSONB DEFAULT '[
    {"level": "Free", "name": "", "description": "", "price": "Gratis"},
    {"level": "Low Ticket", "name": "", "description": "", "price": ""},
    {"level": "Mid Ticket", "name": "", "description": "", "price": ""},
    {"level": "High Ticket", "name": "", "description": "", "price": ""},
    {"level": "Premium", "name": "", "description": "", "price": ""}
  ]'::jsonb,
  ADD COLUMN IF NOT EXISTS platform_stats JSONB DEFAULT '{
    "youtube": {"followers": 0, "growth": 0},
    "instagram": {"followers": 0, "growth": 0},
    "tiktok": {"followers": 0, "growth": 0},
    "threads": {"followers": 0, "growth": 0},
    "linkedin": {"followers": 0, "growth": 0},
    "twitter": {"followers": 0, "growth": 0}
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for avatars (run this separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- CREATE POLICY "Users can upload their own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can update their own avatar"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Avatars are publicly readable"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');
