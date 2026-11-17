-- ============================================================
-- Setup Lengkap Database Portofolio (Aman dijalankan berulang)
-- Salin SELURUH isi file ini ke Supabase SQL Editor lalu klik Run.
-- ============================================================

-- 1. Tabel Pesan Kontak (portfolio_messages)
CREATE TABLE IF NOT EXISTS public.portfolio_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.portfolio_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert messages" ON public.portfolio_messages;
DROP POLICY IF EXISTS "Allow admin read messages" ON public.portfolio_messages;
DROP POLICY IF EXISTS "Allow admin update messages" ON public.portfolio_messages;
DROP POLICY IF EXISTS "Allow admin delete messages" ON public.portfolio_messages;

CREATE POLICY "Allow public insert messages"
ON public.portfolio_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read messages"
ON public.portfolio_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin update messages"
ON public.portfolio_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin delete messages"
ON public.portfolio_messages FOR DELETE TO authenticated USING (true);

-- 2. Fungsi Anti-Spam / Rate Limit Form Kontak
CREATE OR REPLACE FUNCTION public.recent_message_counts(p_email text)
RETURNS TABLE (email_count integer, total_count integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*)::integer FROM public.portfolio_messages
       WHERE lower(email) = lower(p_email)
         AND created_at > now() - interval '1 minute'),
    (SELECT count(*)::integer FROM public.portfolio_messages
       WHERE created_at > now() - interval '1 minute');
$$;

REVOKE ALL ON FUNCTION public.recent_message_counts(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recent_message_counts(text) TO anon, authenticated;

-- 3. Tabel Pengalaman (portfolio_experiences) beserta kolom logo_url
CREATE TABLE IF NOT EXISTS public.portfolio_experiences (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Organisasi',
    year_range TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.portfolio_experiences ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE public.portfolio_experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for all - portfolio_experiences" ON public.portfolio_experiences;
DROP POLICY IF EXISTS "Allow insert for all - portfolio_experiences" ON public.portfolio_experiences;
DROP POLICY IF EXISTS "Allow update for all - portfolio_experiences" ON public.portfolio_experiences;
DROP POLICY IF EXISTS "Allow delete for all - portfolio_experiences" ON public.portfolio_experiences;
DROP POLICY IF EXISTS "Admin write portfolio_experiences" ON public.portfolio_experiences;
DROP POLICY IF EXISTS "Admin update portfolio_experiences" ON public.portfolio_experiences;
DROP POLICY IF EXISTS "Admin delete portfolio_experiences" ON public.portfolio_experiences;

CREATE POLICY "Allow read for all - portfolio_experiences"
ON public.portfolio_experiences FOR SELECT USING (true);

CREATE POLICY "Admin write portfolio_experiences"
ON public.portfolio_experiences FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin update portfolio_experiences"
ON public.portfolio_experiences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin delete portfolio_experiences"
ON public.portfolio_experiences FOR DELETE TO authenticated USING (true);

-- Isi data awal pengalaman sesuai CV jika tabel masih kosong
INSERT INTO public.portfolio_experiences (title, company, type, year_range, description, sort_order)
SELECT * FROM (VALUES
  ('Content Creator & Desainer Komunikasi Visual (DKV)', 'Info Cintamulya, Karta Cintamulya & Peta Cipajaran', 'Organisasi', '2024 — Sekarang', 'Mengelola perencanaan konten, desain publikasi, dokumentasi kegiatan, dan komunikasi visual pada akun Instagram @info.cintamulya, @karta.cintamulya, dan @petacipajaran.', 0),
  ('Fullstack Web Developer & Desainer Visual', 'Proyek Freelance & Independen', 'Freelance', '2024 — Sekarang', 'Merancang dan mengembangkan aplikasi web menggunakan Next.js, TypeScript, dan Supabase PostgreSQL, termasuk dashboard CMS, optimasi SEO, dan keamanan aplikasi.', 1),
  ('Divisi Teknologi Informasi & Komunikasi', 'Organisasi & Proyek Komunitas', 'Organisasi', '2024 — 2026', 'Mendukung kebutuhan desain grafis, komunikasi visual, publikasi digital, serta pengelolaan perangkat TI dan jaringan lokal.', 2)
) AS v(title, company, type, year_range, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.portfolio_experiences);

-- 4. Pastikan kolom logo_url ada di portfolio_tech (jika tabelnya sudah ada)
CREATE TABLE IF NOT EXISTS public.portfolio_tech (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Code2',
    category TEXT NOT NULL DEFAULT 'Pengembangan Web',
    color_class TEXT NOT NULL DEFAULT 'text-cyan-400',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.portfolio_tech ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 5. Bucket Storage portfolio_images & Izin Upload Admin
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio_images', 'portfolio_images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read portfolio_images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload portfolio_images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update portfolio_images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete portfolio_images" ON storage.objects;

CREATE POLICY "Public Read portfolio_images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'portfolio_images' );

CREATE POLICY "Auth Upload portfolio_images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK ( bucket_id = 'portfolio_images' );

CREATE POLICY "Auth Update portfolio_images"
ON storage.objects FOR UPDATE TO authenticated
USING ( bucket_id = 'portfolio_images' );

CREATE POLICY "Auth Delete portfolio_images"
ON storage.objects FOR DELETE TO authenticated
USING ( bucket_id = 'portfolio_images' );
