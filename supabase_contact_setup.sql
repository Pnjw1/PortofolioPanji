-- ============================================================
-- Setup form kontak (aman dijalankan berulang)
-- Jalankan SELURUH file ini sekali di Supabase SQL Editor.
-- Berisi: tabel pesan + RLS + fungsi hitung rate limit.
-- ============================================================

-- 1. Tabel pesan masuk
CREATE TABLE IF NOT EXISTS public.portfolio_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.portfolio_messages ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama dulu supaya file ini bisa dijalankan ulang tanpa error
DROP POLICY IF EXISTS "Allow public insert messages" ON public.portfolio_messages;
DROP POLICY IF EXISTS "Allow admin read messages" ON public.portfolio_messages;
DROP POLICY IF EXISTS "Allow admin update messages" ON public.portfolio_messages;
DROP POLICY IF EXISTS "Allow admin delete messages" ON public.portfolio_messages;

-- Publik hanya boleh mengirim (INSERT)
CREATE POLICY "Allow public insert messages"
ON public.portfolio_messages FOR INSERT WITH CHECK (true);

-- Hanya admin (user login) yang boleh membaca, mengubah, menghapus
CREATE POLICY "Allow admin read messages"
ON public.portfolio_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin update messages"
ON public.portfolio_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin delete messages"
ON public.portfolio_messages FOR DELETE TO authenticated USING (true);

-- 2. Fungsi rate limit
-- Pengunjung anonim tidak punya hak SELECT pada tabel di atas, jadi hitungan
-- dijalankan dengan hak pemilik dan hanya mengembalikan angka.
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
