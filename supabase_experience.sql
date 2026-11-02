-- ============================================================
-- Experience Table: untuk menyimpan pengalaman/timeline
-- Jalankan di Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolio_experiences (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Organisasi',
    year_range TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert data awal
INSERT INTO public.portfolio_experiences (title, company, type, year_range, description, sort_order) VALUES
('Digital Marketing & Video Editing', 'PT Angin Segar Indonesia', 'Freelance', 'Feb 2025 — Des 2025', 'Merancang konten digital marketing, mengedit video promosi, dan mengelola media sosial perusahaan.', 0),
('Ketua Divisi IT', 'Karang Taruna Cintamulya', 'Organisasi', '2024 — Sekarang', 'Mengelola website dan sistem informasi organisasi.', 1),
('Sekretaris', 'PETA CIPAJARAN (Karang Taruna Gabungan)', 'Organisasi', '2023', 'Mengelola administrasi, dokumentasi kegiatan, dan koordinasi antar divisi di organisasi kepemudaan gabungan.', 2);

-- RLS
ALTER TABLE public.portfolio_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for all - portfolio_experiences"
ON public.portfolio_experiences FOR SELECT USING (true);

CREATE POLICY "Allow insert for all - portfolio_experiences"
ON public.portfolio_experiences FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all - portfolio_experiences"
ON public.portfolio_experiences FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all - portfolio_experiences"
ON public.portfolio_experiences FOR DELETE USING (true);
