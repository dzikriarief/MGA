-- ================================================================
-- Muslim Growth Academy — Schema Migration v4
-- Admin Role & RLS Policies for Admin Dashboard
-- ================================================================

-- 1. Add role column to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
    CHECK (role IN ('user', 'admin'));

-- 2. Create a helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Add RLS policies so admins can read ALL user profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (
    auth.uid() = id  -- users can read own
    OR public.is_admin()  -- admins can read all
  );

-- 4. Add RLS policies so admins can read ALL content planner data
DROP POLICY IF EXISTS "Admins can read all content" ON public.content_planner;
CREATE POLICY "Admins can read all content"
  ON public.content_planner
  FOR SELECT
  USING (
    auth.uid() = user_id  -- users can read own
    OR public.is_admin()  -- admins can read all
  );

-- 5. Add RLS policy so admins can delete user profiles
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.user_profiles
  FOR DELETE
  USING (public.is_admin());

-- 6. Add RLS policy so admins can delete content
DROP POLICY IF EXISTS "Admins can delete content" ON public.content_planner;
CREATE POLICY "Admins can delete content"
  ON public.content_planner
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- ================================================================
-- AFTER running this migration, set your admin user:
--
-- UPDATE public.user_profiles
-- SET role = 'admin'
-- WHERE email = 'zikriarief999@gmail.com';
-- ================================================================
