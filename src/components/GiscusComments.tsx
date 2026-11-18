"use client";

import { useEffect, useRef } from 'react';

export default function GiscusComments({ slug }: { slug: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Bersihkan widget lama saat navigasi antar artikel
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', 'Pnjw1/PortofolioPanji');
    script.setAttribute('data-repo-id', 'R_kgDOVgXnyA');
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', 'DIC_kwDOVgXnyM4DLb6g');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'noborder_dark');
    script.setAttribute('data-lang', 'id');

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [slug]);

  return (
    <section className="mt-14 pt-10 border-t border-zinc-800 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white">Diskusi &amp; Komentar</h2>
        <p className="text-xs text-zinc-400">
          Masuk menggunakan akun GitHub untuk meninggalkan komentar atau tanggapan pada tulisan ini.
        </p>
      </div>
      <div ref={containerRef} className="min-h-[160px]" />
    </section>
  );
}
