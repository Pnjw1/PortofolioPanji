-- ============================================================
-- SEO Alt Text System
-- Jalankan script ini di SQL Editor Supabase
-- ============================================================

-- 1. Tambah kolom alt_text ke portfolio_projects (untuk thumbnail)
ALTER TABLE public.portfolio_projects
ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- 2. Tambah kolom alt_text ke project_images (untuk gallery)
ALTER TABLE public.project_images
ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- Keterangan:
-- alt_text digunakan untuk mendeskripsikan gambar kepada Google (SEO)
-- dan Screen Reader (Aksesibilitas). Jika kosong, frontend akan melakukan fallback ke title/caption.
