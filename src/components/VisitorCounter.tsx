"use client";

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function trackVisit() {
      try {
        const visited = sessionStorage.getItem('visited');
        const res = await fetch('/api/visitor-count', {
          method: visited ? 'GET' : 'POST',
        });
        if (!res.ok) return;
        const json = await res.json();
        if (active && typeof json.count === 'number') {
          setCount(json.count);
        }
        if (!visited) {
          sessionStorage.setItem('visited', 'true');
        }
      } catch {
        // Abaikan error jaringan agar tidak mengganggu tampilan utama
      }
    }
    trackVisit();
    return () => {
      active = false;
    };
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
