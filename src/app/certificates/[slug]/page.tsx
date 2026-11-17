"use client";

import { useState, useEffect } from 'react';
import { Award, ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CertificateGroupPage() {
  const params = useParams();
  const rawSlug = params.slug as string;
  const slug = rawSlug ? decodeURIComponent(rawSlug) : '';
  
  const [parent, setParent] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: parentData } = await supabase
        .from('portfolio_certificates')
        .select('*')
        .eq('slug', slug)
        .eq('type', 'group')
        .single();
      
      if (parentData) {
        setParent(parentData);
      }

      const { data: childrenData } = await supabase
        .from('portfolio_certificates')
        .select('*')
        .eq('parent_slug', slug)
        .order('id', { ascending: true });
      
      if (childrenData) {
        setChildren(childrenData);
      }
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
        <div className="container mx-auto px-6 py-24 space-y-8">
          <div className="h-10 w-64 bg-zinc-800/50 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-zinc-800/50 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!parent) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-400 text-lg">Grup sertifikat tidak ditemukan.</p>
          <Link href="/#certificates" className="text-cyan-400 hover:underline">
            ← Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="container mx-auto px-6 py-16 md:py-24 space-y-12">
        {/* Back Button */}
        <div>
          <Link 
            href="/#certificates"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors font-mono text-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-bold text-white">{parent.title}</h1>
          <p className="text-zinc-400 font-mono text-sm">
            {parent.issuer} · {children.length} sertifikat
          </p>
          <div className="w-12 h-0.5 bg-cyan-500" />
        </div>

        {/* Certificate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((cert) => (
            <a
              key={cert.id}
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative h-full p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <Award className="text-zinc-500 group-hover:text-cyan-400 transition-colors mb-4" size={24} />
                <h3 className="text-lg font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors">
                  {cert.title}
                </h3>
                <p className="text-zinc-400 font-mono text-xs">
                  {cert.issuer}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                <span className="text-xs font-mono text-cyan-400 px-2 py-1 bg-cyan-950/30 rounded border border-cyan-900/50 flex items-center gap-1">
                  LIHAT <ExternalLink size={10} />
                </span>
                <span className="text-zinc-500 font-mono text-sm">
                  {cert.year}
                </span>
              </div>
            </a>
          ))}
        </div>

        {children.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 font-mono">Belum ada sertifikat di grup ini.</p>
          </div>
        )}
      </div>
    </main>
  );
}
