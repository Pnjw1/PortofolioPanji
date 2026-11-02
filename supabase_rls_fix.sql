-- ============================================================
-- FIX RLS: Tambah policy INSERT, UPDATE, DELETE untuk semua tabel
-- Jalankan ini di Supabase SQL Editor
-- ============================================================

-- ================== portfolio_tech ==================
CREATE POLICY "Allow insert for all - portfolio_tech"
ON public.portfolio_tech FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update for all - portfolio_tech"
ON public.portfolio_tech FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete for all - portfolio_tech"
ON public.portfolio_tech FOR DELETE
USING (true);

-- ================== portfolio_projects ==================
CREATE POLICY "Allow insert for all - portfolio_projects"
ON public.portfolio_projects FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update for all - portfolio_projects"
ON public.portfolio_projects FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete for all - portfolio_projects"
ON public.portfolio_projects FOR DELETE
USING (true);

-- ================== portfolio_certificates ==================
CREATE POLICY "Allow insert for all - portfolio_certificates"
ON public.portfolio_certificates FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update for all - portfolio_certificates"
ON public.portfolio_certificates FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete for all - portfolio_certificates"
ON public.portfolio_certificates FOR DELETE
USING (true);
