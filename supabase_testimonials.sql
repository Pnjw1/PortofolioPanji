-- ============================================================
-- Testimonials: tabel untuk testimoni dari klien/teman/guru
-- Jalankan di Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolio_testimonials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.portfolio_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for all - portfolio_testimonials"
ON public.portfolio_testimonials FOR SELECT USING (true);

CREATE POLICY "Allow insert for all - portfolio_testimonials"
ON public.portfolio_testimonials FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all - portfolio_testimonials"
ON public.portfolio_testimonials FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all - portfolio_testimonials"
ON public.portfolio_testimonials FOR DELETE USING (true);
