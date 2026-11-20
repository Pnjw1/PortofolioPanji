import { createClient } from '@supabase/supabase-js';

// Client publik tanpa cookies() agar halaman Server Component publik
// bisa menggunakan ISR (export const revalidate = 60) dan di-cache di Vercel Edge.
export function createSupabasePublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
