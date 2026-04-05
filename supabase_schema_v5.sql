-- ================================================================
-- Muslim Growth Academy — Schema Migration v5
-- Projects, Offers, Competitors, Market Estimation
-- ================================================================

-- 1. Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nama        TEXT NOT NULL,
  tipe        TEXT DEFAULT 'Endorsement' CHECK (tipe IN ('Endorsement', 'Kolaborasi', 'Target Brand')),
  status      TEXT DEFAULT 'Prospect' CHECK (status IN ('Prospect', 'Negosiasi', 'In Progress', 'Done', 'Rejected')),
  brand       TEXT,
  fee         TEXT,
  deadline    DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins read all projects" ON public.projects
  FOR SELECT USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);

-- 2. Brand Offers table
CREATE TABLE IF NOT EXISTS public.brand_offers (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nama             TEXT NOT NULL,
  tagline          TEXT,
  deskripsi        TEXT,
  harga            TEXT,
  format_delivery  TEXT,
  target_audience  TEXT,
  unique_value     TEXT,
  status           TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Archived')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.brand_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own offers" ON public.brand_offers
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins read all offers" ON public.brand_offers
  FOR SELECT USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_offers_user ON public.brand_offers(user_id);

-- 3. Competitors table
CREATE TABLE IF NOT EXISTS public.competitors (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform    TEXT DEFAULT 'Short-form' CHECK (platform IN ('Short-form', 'Long-form')),
  username    TEXT NOT NULL,
  name        TEXT,
  niche       TEXT,
  bio         TEXT,
  produk      TEXT,
  followers   INTEGER DEFAULT 0,
  top_konten  JSONB DEFAULT '[]'::jsonb,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own competitors" ON public.competitors
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins read all competitors" ON public.competitors
  FOR SELECT USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_competitors_user ON public.competitors(user_id);

-- 4. Market Estimation table
CREATE TABLE IF NOT EXISTS public.market_estimation (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tam_value           NUMERIC DEFAULT 0,
  tam_desc            TEXT,
  sam_value           NUMERIC DEFAULT 0,
  sam_desc            TEXT,
  som_value           NUMERIC DEFAULT 0,
  som_desc            TEXT,
  avg_revenue_user    NUMERIC DEFAULT 0,
  monthly_revenue_est NUMERIC DEFAULT 0,
  assumptions         TEXT,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.market_estimation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own estimation" ON public.market_estimation
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins read all estimations" ON public.market_estimation
  FOR SELECT USING (public.is_admin());
