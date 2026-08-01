-- =====================================================================
-- John20 Deals — INCREMENTAL MIGRATION (run on live DB, NOT destructive)
-- Copy & run in Supabase SQL Editor. Safe to run on existing data.
-- =====================================================================

-- 1. Add swap_allowed to products (missing column)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS swap_allowed BOOLEAN DEFAULT false;

-- 2. Create sell_requests (for the "Sell Your Device" flow)
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

-- 3. Create repair_requests (for the "Book a Repair" flow)
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

-- 4. Disable RLS on the new tables (matches existing tables; RLS hardening
--    requires a Clerk->Supabase JWT template, see schema.sql notes)
ALTER TABLE public.sell_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests DISABLE ROW LEVEL SECURITY;
