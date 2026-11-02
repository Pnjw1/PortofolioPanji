-- ============================================================
-- Project Detail System: type, slug + tabel project_images
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tambah kolom type dan slug ke portfolio_projects
ALTER TABLE portfolio_projects
ADD COLUMN IF NOT EXISTS type text DEFAULT 'link',
ADD COLUMN IF NOT EXISTS slug text;

-- type: 'link' (langsung ke URL) atau 'detail' (buka halaman showcase)
-- slug: URL-friendly identifier (misal 'karang-taruna')

-- 2. Buat tabel untuk gallery images per project
CREATE TABLE IF NOT EXISTS public.project_images (
    id SERIAL PRIMARY KEY,
    project_slug TEXT NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS dan buat policies
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users - project_images"
ON public.project_images FOR SELECT USING (true);

CREATE POLICY "Allow insert for all - project_images"
ON public.project_images FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all - project_images"
ON public.project_images FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all - project_images"
ON public.project_images FOR DELETE USING (true);
