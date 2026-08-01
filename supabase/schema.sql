-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DROP existing tables and policies to start fresh (Run this if you get policy dependency errors)
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;

-- 2. Create tables
CREATE TABLE public.profiles (
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

CREATE TABLE public.products (
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

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    products JSONB NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    delivery_method TEXT,
    shipping_address TEXT
);

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL
);

CREATE TABLE public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE public.swap_requests (
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

CREATE TABLE public.sell_requests (
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

CREATE TABLE public.repair_requests (
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

-- 3. Set up RLS (Row Level Security)
-- Note: Since we are using Clerk for auth, Supabase does not know who is logged in natively
-- unless you configure a custom JWT integration. For prototyping, we will disable RLS.
-- (If you want to re-enable it later, you will need to set up Clerk + Supabase JWT template)

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sell_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests DISABLE ROW LEVEL SECURITY;


-- 4. Set up Storage for Product Images
-- Insert the product-images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for product-images (Public since RLS is currently off for the db, let's allow inserts)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
