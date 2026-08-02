-- =====================================================================
-- John20 Deals — REPAIR V2 MIGRATION (run on live DB, NOT destructive)
-- Copy & run in Supabase SQL Editor. Safe to run on existing data.
-- Adds quote/pickup/cancel support to repair_requests.
-- =====================================================================

ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS repair_cost NUMERIC;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMPTZ;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS decline_reason TEXT;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE public.repair_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;
