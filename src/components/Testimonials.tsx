"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  message: string;
  avatar_url?: string;
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="relative p-5 md:p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
      <Quote size={48} className="absolute top-3 right-3 text-zinc-800/30 rotate-180" />

      <div className="relative z-10 space-y-4">
        <p className="text-sm md:text-base text-zinc-300 leading-relaxed italic line-clamp-3 break-words">
          &ldquo;{item.message}&rdquo;
        </p>

        <div className="flex items-center gap-3">
          {item.avatar_url ? (
            <div
              role="img"
              aria-label={`Testimoni dari ${item.name} (${item.role})`}
              className="relative w-10 h-10 rounded-full overflow-hidden border border-cyan-500/30 bg-cover bg-center shrink-0"
              style={{ backgroundImage: `url("${encodeURI(item.avatar_url)}")` }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400 font-bold">
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-white text-sm">{item.name}</p>
            <p className="text-xs text-zinc-400">{item.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials({ initialTestimonials = [] }: { initialTestimonials?: Testimonial[] }) {
  const testimonials = initialTestimonials;
  const [page, setPage] = useState(0);

  const perPage = 2;
  const totalPages = Math.ceil(testimonials.length / perPage);
  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

  if (testimonials.length === 0) return null;

  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Testimoni</h2>
        <div className="w-12 h-0.5 bg-cyan-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((item) => (
          <TestimonialCard key={item.id} item={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Testimoni sebelumnya"
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-zinc-400 font-mono">{page + 1}/{totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            aria-label="Testimoni berikutnya"
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
