-- =====================================================================
-- John20 Deals — REVERT RLS (rollback to client-side Supabase era)
-- Run AFTER rolling the codebase back to the pre-Vercel architecture,
-- where the frontend talks to Supabase directly with the anon key and
-- no serverless service-role functions back it up.
--
-- migration_final.sql enabled RLS (public read only on products/reviews;
-- nothing for the rest), which breaks client-side anon reads/writes for
-- orders, admin dashboard, swap/sell/repair, newsletter, notifications.
--
-- This file DISABLES row-level security again (non-destructive: no data
-- is dropped, columns/indexes are untouched) and restores the storage
-- bucket to public read/write compatible with direct client access.
-- Safe to run repeatedly. Copy & run in Supabase SQL Editor.
-- =====================================================================

-- =====================================================================
-- 1. DISABLE RLS (match the ENABLE list from migration_final.sql)
-- =====================================================================

ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sell_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 2. DROP the policies migration_final.sql created (harmless if absent)
-- =====================================================================

DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;

-- =====================================================================
-- 3. RESTORE storage bucket to public read/write (compatible with
--    client-side uploads using the anon key)
-- =====================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- =====================================================================
-- 4. VERIFY
-- =====================================================================

-- Expect: 0 (all tables have RLS disabled)
SELECT 'rls_enabled_tables' AS check_name, count(*) AS value
FROM pg_tables
WHERE schemaname = 'public'
  AND EXISTS (
    SELECT 1 FROM pg_class c
    WHERE c.oid = ('public.' || pg_tables.tablename)::regclass
      AND c.relrowsecurity = true
  );

-- Expect: 0 rows
SELECT 'legacy_rls_policies' AS check_name, count(*) AS value
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname IN ('products_public_read', 'reviews_public_read');

-- Expect: 4 (public read/insert/update/delete on product-images)
SELECT 'storage_policies' AS check_name, count(*) AS value
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';