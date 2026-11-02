-- ============================================================
-- SECURITY PATCH: Mengunci Tabel dari Akses Publik
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tabel Projects
DROP POLICY IF EXISTS "Enable insert access for all users - portfolio_projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Enable delete access for all users - portfolio_projects" ON public.portfolio_projects;

CREATE POLICY "Admin only insert - portfolio_projects" ON public.portfolio_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin only update - portfolio_projects" ON public.portfolio_projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only delete - portfolio_projects" ON public.portfolio_projects FOR DELETE TO authenticated USING (true);

-- 2. Tabel Certificates
DROP POLICY IF EXISTS "Enable insert access for all users - portfolio_certificates" ON public.portfolio_certificates;
DROP POLICY IF EXISTS "Enable delete access for all users - portfolio_certificates" ON public.portfolio_certificates;

CREATE POLICY "Admin only insert - portfolio_certificates" ON public.portfolio_certificates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin only update - portfolio_certificates" ON public.portfolio_certificates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only delete - portfolio_certificates" ON public.portfolio_certificates FOR DELETE TO authenticated USING (true);

-- 3. Tabel Tech
DROP POLICY IF EXISTS "Enable insert access for all users - portfolio_tech" ON public.portfolio_tech;
DROP POLICY IF EXISTS "Enable delete access for all users - portfolio_tech" ON public.portfolio_tech;

-- (Tech mungkin sudah dipatch di script sebelumnya, tapi kita pastikan lagi)
DROP POLICY IF EXISTS "Only admin insert tech" ON public.portfolio_tech;
DROP POLICY IF EXISTS "Only admin update tech" ON public.portfolio_tech;
DROP POLICY IF EXISTS "Only admin delete tech" ON public.portfolio_tech;

CREATE POLICY "Admin only insert - portfolio_tech" ON public.portfolio_tech FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin only update - portfolio_tech" ON public.portfolio_tech FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only delete - portfolio_tech" ON public.portfolio_tech FOR DELETE TO authenticated USING (true);

-- 4. Tabel Project Images (Galeri Project Detail)
DROP POLICY IF EXISTS "Allow insert for all - project_images" ON public.project_images;
DROP POLICY IF EXISTS "Allow update for all - project_images" ON public.project_images;
DROP POLICY IF EXISTS "Allow delete for all - project_images" ON public.project_images;

CREATE POLICY "Admin only insert - project_images" ON public.project_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin only update - project_images" ON public.project_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only delete - project_images" ON public.project_images FOR DELETE TO authenticated USING (true);

-- Pastikan semua READ (SELECT) tetap bisa diakses publik agar website tetap tampil
DROP POLICY IF EXISTS "Enable read access for all users - project_images" ON public.project_images;
CREATE POLICY "Public read - project_images" ON public.project_images FOR SELECT USING (true);
