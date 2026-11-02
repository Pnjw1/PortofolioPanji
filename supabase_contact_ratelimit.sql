-- Rate limit form kontak.
-- Tabel portfolio_messages hanya bisa di-SELECT oleh user terautentikasi (RLS),
-- jadi pengunjung anonim tidak bisa menghitung pesan sendiri. Fungsi ini
-- menjalankan hitungan dengan hak pemilik dan hanya mengembalikan angka.
-- Jalankan sekali di Supabase SQL Editor.

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
