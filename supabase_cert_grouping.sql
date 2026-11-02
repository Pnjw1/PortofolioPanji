-- ============================================================
-- Certificate Grouping: Tambah kolom type, slug, parent_slug
-- ============================================================

-- type: 'link' (langsung ke URL) atau 'group' (buka halaman detail)
-- slug: URL-friendly identifier (misal 'dicoding')
-- parent_slug: untuk sertifikat anak, merujuk ke slug parent-nya

ALTER TABLE portfolio_certificates
ADD COLUMN IF NOT EXISTS type text DEFAULT 'link',
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS parent_slug text;

-- Contoh: Update sertifikat Dicoding yang sudah ada jadi type 'group'
-- UPDATE portfolio_certificates SET type = 'group', slug = 'dicoding' WHERE title = 'Dicoding Indonesia';

-- Contoh: Insert sertifikat anak di bawah grup 'dicoding'
-- INSERT INTO portfolio_certificates (title, issuer, year, link, type, parent_slug)
-- VALUES ('Belajar Dasar AI', 'Dicoding Indonesia', '2024', 'https://...', 'link', 'dicoding');
