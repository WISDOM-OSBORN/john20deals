-- =====================================================================
-- John20 Deals — SWAP ACCEPTANCE MIGRATION (run on live DB, NOT destructive)
-- Creates swap_requests (if missing) and adds accepted-swap condition
-- columns + WhatsApp notification tracking. Copy & run in Supabase SQL Editor.
-- =====================================================================

-- 1. Create swap_requests table if it doesn't exist yet
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

-- 2. Trade-in value offered for the customer's device (GHS)
ALTER TABLE public.swap_requests ADD COLUMN IF NOT EXISTS trade_in_value NUMERIC;

-- 3. Cash difference the customer pays (or receives) on top of trade-in (GHS)
ALTER TABLE public.swap_requests ADD COLUMN IF NOT EXISTS cash_difference NUMERIC;

-- 4. Free-text terms of the accepted swap (delivery, warranty, etc.)
ALTER TABLE public.swap_requests ADD COLUMN IF NOT EXISTS terms TEXT;

-- 5. Timestamp when admin accepted & sent the WhatsApp notification
ALTER TABLE public.swap_requests ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- 6. Ensure RLS stays disabled (matches existing tables)
ALTER TABLE public.swap_requests DISABLE ROW LEVEL SECURITY;
