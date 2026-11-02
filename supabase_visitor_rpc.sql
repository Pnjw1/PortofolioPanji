-- =============================================
-- Atomic Page View Increment Function
-- Jalankan di Supabase SQL Editor
--
-- Menggantikan logika SELECT + UPDATE terpisah
-- di VisitorCounter.tsx yang rawan race condition.
-- Fungsi ini atomic — aman untuk concurrent requests.
-- =============================================

CREATE OR REPLACE FUNCTION increment_page_views()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE page_views
  SET
    count = count + 1,
    updated_at = NOW()
  WHERE id = 1
  RETURNING count INTO new_count;

  -- Jika baris belum ada, buat baru
  IF new_count IS NULL THEN
    INSERT INTO page_views (id, count, updated_at)
    VALUES (1, 1, NOW())
    ON CONFLICT (id) DO UPDATE
      SET count = page_views.count + 1,
          updated_at = NOW()
    RETURNING count INTO new_count;
  END IF;

  RETURN new_count;
END;
$$;

-- Berikan akses ke anon role agar bisa dipanggil dari client
GRANT EXECUTE ON FUNCTION increment_page_views() TO anon;
GRANT EXECUTE ON FUNCTION increment_page_views() TO authenticated;
