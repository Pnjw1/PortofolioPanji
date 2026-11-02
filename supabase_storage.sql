-- ============================================================
-- LANGKAH 1: Buat bucket portfolio_images (jalankan duluan)
-- ============================================================
insert into storage.buckets (id, name, public) 
values ('portfolio_images', 'portfolio_images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- LANGKAH 2: Buat RLS Policy untuk Storage
-- Karena admin panel pakai anon key, kita izinkan anon juga
-- ============================================================

-- Izinkan semua orang untuk melihat/membaca file (public read)
CREATE POLICY "Public Read portfolio_images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'portfolio_images' );

-- Izinkan anon (admin panel) untuk upload file
CREATE POLICY "Anon Upload portfolio_images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK ( bucket_id = 'portfolio_images' );

-- Izinkan anon untuk update file
CREATE POLICY "Anon Update portfolio_images"
ON storage.objects FOR UPDATE
TO anon
USING ( bucket_id = 'portfolio_images' );

-- Izinkan anon untuk delete file
CREATE POLICY "Anon Delete portfolio_images"
ON storage.objects FOR DELETE
TO anon
USING ( bucket_id = 'portfolio_images' );
