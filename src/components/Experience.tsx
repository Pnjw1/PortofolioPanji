"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building2, Users, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Experience {
  id: number;
  title: string;
  company: string;
  year_range: string;
  type: string;
  description?: string;
  sort_order: number;
  logo_url?: string | null;
}

const typeIcons: Record<string, LucideIcon> = {
  'Freelance': Building2,
  'Organisasi': Users,
};

export default function Experience() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error: fetchError } = await supabase
          .from('portfolio_experiences')
          .select('*')
          .order('sort_order', { ascending: true });
        if (fetchError) throw fetchError;
        if (data) setExperiences(data);
      } catch (err) {
        console.error('Error fetching experiences:', err);
        setError(true);
      }
    }
    fetch();
  }, []);

  const perPage = 3;
  const totalPages = Math.ceil(experiences.length / perPage);
  const visible = experiences.slice(page * perPage, page * perPage + perPage);

  if (experiences.length === 0) return null;

  return (
    <section id="experience" className="space-y-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Briefcase className="text-cyan-400" size={32} />
              <span>Experience</span>
            </h2>
            <div className="w-12 h-0.5 bg-cyan-500" />
          </div>

          {/* Pagination arrows */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs text-zinc-500 font-mono">{page + 1}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-emerald-500/50" />

        <div className="space-y-8">
          {visible.map((exp, index) => {
            const colors = ['bg-cyan-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500'];
            const gradients = ['from-cyan-500 to-blue-500', 'from-emerald-500 to-green-500', 'from-purple-500 to-fuchsia-500', 'from-amber-500 to-orange-500', 'from-pink-500 to-rose-500'];
            const dotColor = colors[(page * perPage + index) % colors.length];
            const gradientColor = gradients[(page * perPage + index) % gradients.length];
            const Icon = typeIcons[exp.type] || Users;

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="relative pl-12 md:pl-16 group"
              >
                {/* Timeline dot */}
                <div className={`absolute left-[12px] md:left-[16px] top-2 w-[15px] h-[15px] rounded-full ${dotColor} ring-4 ring-[#0a0a0a] z-10 group-hover:scale-125 transition-transform`} />

                {/* Card */}
                <div className="p-5 md:p-6 bg-[#1e1e1e] border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all duration-300 group-hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {exp.logo_url ? (
                        <Image 
                          src={exp.logo_url} 
                          alt={exp.company} 
                          fill 
                          sizes="44px" 
                          className="object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white font-bold text-lg font-sans`}>
                          {exp.company ? exp.company.charAt(0).toUpperCase() : <Icon size={20} />}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3 className="text-lg font-bold text-white">{exp.title}</h3>
                        <span className="text-xs font-mono px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700 shrink-0 w-fit">
                          {exp.year_range}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-cyan-400 font-medium">{exp.company}</span>
                        <span className="text-xs px-2 py-0.5 bg-zinc-800/50 text-zinc-500 rounded border border-zinc-800 font-mono">
                          {exp.type}
                        </span>
                      </div>

                      {exp.description && (
                        <p className="text-sm text-zinc-400 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
