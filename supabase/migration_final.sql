-- =====================================================================
-- John20 Deals — FINAL CONSOLIDATED MIGRATION (run once on live DB)
-- Idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS). Safe to run on
-- existing data. Copy & run the WHOLE file in Supabase SQL Editor.
-- =====================================================================

-- =====================================================================
-- 1. TABLES
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    image_url_2 TEXT,
    category TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    condition TEXT,
    swap_allowed BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    phone_number TEXT,
    is_whatsapp BOOLEAN,
    location TEXT
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    products JSONB NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    delivery_method TEXT,
    shipping_address TEXT
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.swap_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT,
    offer_description TEXT,
    image_url_1 TEXT,
    image_url_2 TEXT,
    image_url_3 TEXT
);

CREATE TABLE IF NOT EXISTS public.sell_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    device_type TEXT,
    brand TEXT,
    model TEXT,
    condition TEXT,
    description TEXT,
    offer_price NUMERIC,
    image_url_1 TEXT,
    image_url_2 TEXT,
    image_url_3 TEXT
);

CREATE TABLE IF NOT EXISTS public.repair_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'received',
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    device_type TEXT,
    issue_description TEXT,
    image_url_1 TEXT,
    image_url_2 TEXT,
    image_url_3 TEXT
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT false
);

-- =====================================================================
-- 2. ADD COLUMNS (idempotent)
-- =====================================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS swap_allowed BOOLEAN DEFAULT false;

ALTER TABLE public.swap_requests ADD COLUMN IF NOT EXISTS trade_in_value NUMERIC;
ALTER TABLE public.swap_requests ADD COLUMN IF NOT EXISTS cash_difference NUMERIC;
ALTER TABLE public.swap_requests ADD COLUMN IF NOT EXISTS terms TEXT;
ALTER TABLE public.swap_requests ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS repair_cost NUMERIC;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMPTZ;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS decline_reason TEXT;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- =====================================================================
-- 3. INDEXES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swap_user ON public.swap_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sell_user ON public.sell_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_repair_user ON public.repair_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, created_at DESC);

-- =====================================================================
-- 4. ROW LEVEL SECURITY (Phase 5 hardening)
-- All client (anon key) writes are blocked. The storefront can only
-- READ products. Every other read/write goes through the Netlify
-- functions which use the service-role key (bypasses RLS).
-- =====================================================================

-- products: public read-only catalog
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);

-- reviews: public read-only (name + rating + comment); writes via service role
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);

-- everything else: anon gets nothing; service role (functions) bypasses RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 5. STORAGE (product-images bucket)
-- Uploads actually go to Cloudflare R2 via presigned URLs; this bucket is
-- retained for compatibility. Public read only; writes via service role.
-- =====================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- =====================================================================
-- 6. VERIFY
-- Run each query and confirm it returns a value without error.
-- =====================================================================

-- Expect: 8 tables
SELECT 'tables' AS check_name, count(*) AS value FROM pg_tables WHERE schemaname = 'public';

-- Expect: 2 rows (products_public_read + reviews_public_read)
SELECT 'public_read_policies' AS check_name, count(*) AS value
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname IN ('products_public_read', 'reviews_public_read');

-- Expect: new repair columns present
SELECT 'repair_v2_columns' AS check_name, count(*) AS value
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'repair_requests'
  AND column_name IN ('diagnosis','repair_cost','estimated_completion','completed_at','decline_reason','cancelled_at','admin_notes');

-- Expect: swap condition columns present
SELECT 'swap_condition_columns' AS check_name, count(*) AS value
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'swap_requests'
  AND column_name IN ('trade_in_value','cash_difference','terms','notified_at');
