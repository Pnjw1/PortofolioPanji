-- ============================================================
-- 1. Contact Form: Tabel Pesan Masuk
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS untuk Messages
ALTER TABLE public.portfolio_messages ENABLE ROW LEVEL SECURITY;

-- Publik bisa mengirim pesan (INSERT)
CREATE POLICY "Allow public insert messages" 
ON public.portfolio_messages FOR INSERT WITH CHECK (true);

-- Hanya admin (Authenticated) yang bisa membaca pesan
CREATE POLICY "Allow admin read messages" 
ON public.portfolio_messages FOR SELECT TO authenticated USING (true);

-- Hanya admin yang bisa update (tandai sudah dibaca) dan delete
CREATE POLICY "Allow admin update messages" 
ON public.portfolio_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin delete messages" 
ON public.portfolio_messages FOR DELETE TO authenticated USING (true);


-- ============================================================
-- 2. Blog View Counter: Kolom & Fungsi RPC
-- ============================================================

-- Buat tabel portfolio_posts jika ternyata belum ada sama sekali
CREATE TABLE IF NOT EXISTS public.portfolio_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_url TEXT,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tambahkan kolom views jika belum ada
ALTER TABLE public.portfolio_posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Buat fungsi RPC untuk increment views agar aman (tidak perlu buka akses UPDATE ke publik)
CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE portfolio_posts
  SET views = COALESCE(views, 0) + 1
  WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 3. RLS Security Patch: Mengunci Tabel Lain
-- ============================================================

-- A. Portfolio Posts (Pastikan tabel ada)
DROP POLICY IF EXISTS "Allow insert for all - portfolio_posts" ON public.portfolio_posts;
DROP POLICY IF EXISTS "Allow update for all - portfolio_posts" ON public.portfolio_posts;
DROP POLICY IF EXISTS "Allow delete for all - portfolio_posts" ON public.portfolio_posts;

CREATE POLICY "Only admin insert posts" ON public.portfolio_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Only admin update posts" ON public.portfolio_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Only admin delete posts" ON public.portfolio_posts FOR DELETE TO authenticated USING (true);

-- B. Portfolio Testimonials
CREATE TABLE IF NOT EXISTS public.portfolio_testimonials (id SERIAL PRIMARY KEY);
DROP POLICY IF EXISTS "Allow insert for all - portfolio_testimonials" ON public.portfolio_testimonials;
DROP POLICY IF EXISTS "Allow update for all - portfolio_testimonials" ON public.portfolio_testimonials;
DROP POLICY IF EXISTS "Allow delete for all - portfolio_testimonials" ON public.portfolio_testimonials;

CREATE POLICY "Only admin insert testimonials" ON public.portfolio_testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Only admin update testimonials" ON public.portfolio_testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Only admin delete testimonials" ON public.portfolio_testimonials FOR DELETE TO authenticated USING (true);

-- C. Portfolio Tech
CREATE TABLE IF NOT EXISTS public.portfolio_tech (id SERIAL PRIMARY KEY);
DROP POLICY IF EXISTS "Allow insert for all - portfolio_tech" ON public.portfolio_tech;
DROP POLICY IF EXISTS "Allow update for all - portfolio_tech" ON public.portfolio_tech;
DROP POLICY IF EXISTS "Allow delete for all - portfolio_tech" ON public.portfolio_tech;

CREATE POLICY "Only admin insert tech" ON public.portfolio_tech FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Only admin update tech" ON public.portfolio_tech FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Only admin delete tech" ON public.portfolio_tech FOR DELETE TO authenticated USING (true);
