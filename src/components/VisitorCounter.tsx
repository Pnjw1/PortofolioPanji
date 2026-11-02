"use client";

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function trackVisit() {
      try {
        const visited = sessionStorage.getItem('visited');

        if (!visited) {
          // Gunakan atomic RPC agar tidak ada race condition
          // saat banyak user mengakses secara bersamaan
          const { data, error } = await supabase.rpc('increment_page_views');
          if (error) throw error;
          if (data !== null) setCount(data);
          sessionStorage.setItem('visited', 'true');
        } else {
          // Cuma baca, jangan increment
          const { data, error } = await supabase
            .from('page_views')
            .select('count')
            .eq('id', 1)
            .single();
          if (error) throw error;
          if (data) setCount(data.count);
        }
      } catch (err) {
        console.error('Error tracking visit:', err);
      }
    }
    trackVisit();
  }, []);

  if (count === null) return null;

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-sm">
      <Eye size={14} className="text-cyan-400" />
      <span className="text-zinc-400">
        <span className="text-white font-bold">{count.toLocaleString('id-ID')}</span> pengunjung
      </span>
    </div>
  );
}
