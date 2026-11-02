"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareQuote, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  message: string;
  avatar_url?: string;
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="relative p-5 md:p-6 bg-[#1e1e1e] border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
      <Quote size={60} className="absolute top-3 right-3 text-zinc-800/20 rotate-180" />

      <div className="relative z-10 space-y-4">
        <p className="text-sm md:text-base text-zinc-300 leading-relaxed italic line-clamp-3 break-words">
          &ldquo;{item.message}&rdquo;
        </p>

        <div className="flex items-center gap-3">
          {item.avatar_url ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-500/30">
              <Image src={item.avatar_url} alt={item.name} fill sizes="40px" className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-white text-sm">{item.name}</p>
            <p className="text-xs text-zinc-500">{item.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('portfolio_testimonials')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setTestimonials(data);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const perPage = 2;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  return (
    <section id="testimonials" className="space-y-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <MessageSquareQuote className="text-cyan-400" size={32} />
            <span>Testimonials</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-zinc-800/30 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#1e1e1e]/30 border border-zinc-800/80 text-center space-y-3 max-w-lg mx-auto">
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">
            Belum ada testimoni yang ditambahkan. Punya saran, feedback, atau ingin memberikan ulasan kerja sama? Hubungi saya di bagian kontak!
          </p>
        </div>
      ) : (
        <>
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {visible.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                aria-label="Testimoni sebelumnya"
                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs text-zinc-500 font-mono">{page + 1}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                aria-label="Testimoni berikutnya"
                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
