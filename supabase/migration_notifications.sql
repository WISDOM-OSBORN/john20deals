-- =====================================================================
-- John20 Deals — IN-APP NOTIFICATIONS MIGRATION (run on live DB, safe)
-- Creates the notifications table used by the bell + dashboards.
-- Copy & run in Supabase SQL Editor.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON public.notifications (user_id, created_at DESC);

-- Ensure RLS stays disabled (matches existing tables)
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
