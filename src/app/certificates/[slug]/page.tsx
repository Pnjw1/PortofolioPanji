"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CertificateGroupPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [parent, setParent] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch the parent group info
      const { data: parentData } = await supabase
        .from('portfolio_certificates')
        .select('*')
        .eq('slug', slug)
        .eq('type', 'group')
        .single();
      
      if (parentData) {
        setParent(parentData);
      }

      // Fetch all children
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
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 relative overflow-hidden">
      {/* Background ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-900/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[150px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16 md:py-24 space-y-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            href="/#certificates"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors font-mono text-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-3xl md:text-5xl font-bold flex items-center gap-4">
            <Award className="text-cyan-400" size={40} />
            <span>{parent.title}</span>
          </h1>
          <p className="text-zinc-400 font-mono text-sm">
            {parent.issuer} · {children.length} sertifikat
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
        </motion.div>

        {/* Certificate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((cert, index) => (
            <motion.a
              key={cert.id}
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="group relative p-[1px] rounded-2xl overflow-hidden bg-zinc-800 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-shadow duration-500 block"
            >
              {/* Hologram Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-overlay transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
              
              <div className="relative h-full p-6 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-cyan-500/50 transition-colors duration-300 z-20 flex flex-col justify-between overflow-hidden">
                {/* Gradient blob */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700" />

                <div className="relative z-30">
                  <Award className="text-zinc-500 group-hover:text-cyan-400 transition-colors duration-300 mb-4" size={24} />
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors duration-300">
                    {cert.title}
                  </h3>
                  <p className="text-zinc-400 font-mono text-xs">
                    {cert.issuer}
                  </p>
                </div>

                <div className="relative z-30 mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                  <span className="text-xs font-mono text-cyan-400/80 px-2 py-1 bg-cyan-950/30 rounded border border-cyan-900/50 group-hover:bg-cyan-900/50 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                    LIHAT <ExternalLink size={10} />
                  </span>
                  <span className="text-zinc-500 font-mono text-sm">
                    {cert.year}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Empty state */}
        {children.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 font-mono">Belum ada sertifikat di grup ini.</p>
          </div>
        )}
      </div>
    </main>
  );
}
