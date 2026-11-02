-- ============================================================
-- Visitor Counter: tabel untuk menghitung total kunjungan
-- Jalankan di Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.page_views (
    id INTEGER PRIMARY KEY DEFAULT 1,
    count BIGINT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert baris awal
INSERT INTO public.page_views (id, count) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for all - page_views"
ON public.page_views FOR SELECT USING (true);

CREATE POLICY "Allow update for all - page_views"
ON public.page_views FOR UPDATE USING (true) WITH CHECK (true);
