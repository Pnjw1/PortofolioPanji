"use client";

import { useState } from 'react';
import { Building2, Users, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';

export interface ExperienceItem {
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

// Mengekstrak logo jika disimpan sebagai fallback di dalam description
export function parseExperienceItem(item: ExperienceItem): ExperienceItem {
  const rawDesc = item.description || '';
  const match = rawDesc.match(/\n?<!--logo:(.+?)-->$/);
  if (match) {
    return {
      ...item,
      logo_url: item.logo_url || match[1],
      description: rawDesc.replace(/\n?<!--logo:(.+?)-->$/, '').trim(),
    };
  }
  return item;
}

export function embedLogoInDescription(description: string | null | undefined, logoUrl: string | null | undefined): string | null {
  const cleanDesc = (description || '').replace(/\n?<!--logo:(.+?)-->$/, '').trim();
  if (!logoUrl) return cleanDesc || null;
  return cleanDesc ? `${cleanDesc}\n<!--logo:${logoUrl}-->` : `<!--logo:${logoUrl}-->`;
}

export default function Experience({ initialExperiences = [] }: { initialExperiences?: ExperienceItem[] }) {
  const experiences = initialExperiences.map(parseExperienceItem);
  const [page, setPage] = useState(0);

  const perPage = 4;
  const totalPages = Math.ceil(experiences.length / perPage);
  const visible = experiences.slice(page * perPage, page * perPage + perPage);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Pengalaman</h2>
          <div className="w-12 h-0.5 bg-cyan-500" />
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Halaman pengalaman sebelumnya"
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs text-zinc-400 font-mono">{page + 1}/{totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              aria-label="Halaman pengalaman berikutnya"
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {experiences.length === 0 ? (
        <div className="p-8 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center">
          <p className="text-sm text-zinc-400">Belum ada data pengalaman yang ditampilkan.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Garis vertikal timeline */}
          <div className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-zinc-800" />

          <div className="space-y-6">
            {visible.map((exp) => {
              const Icon = typeIcons[exp.type] || Users;

              return (
                <div key={exp.id} className="relative pl-12 md:pl-16 group">
                  {/* Titik timeline */}
                  <div className="absolute left-[13px] md:left-[17px] top-3 w-[13px] h-[13px] rounded-full bg-cyan-500 ring-4 ring-[#0a0a0a] z-10" />

                  {/* Kartu pengalaman */}
                  <div className="p-5 md:p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {exp.logo_url ? (
                        <div className="h-14 min-w-[56px] max-w-[112px] px-2.5 py-1.5 rounded-lg bg-white/95 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={exp.logo_url}
                            alt={`Logo ${exp.company}`}
                            className="max-h-11 max-w-[96px] w-auto h-auto object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 text-cyan-400 font-bold text-lg">
                          {exp.company ? exp.company.charAt(0).toUpperCase() : <Icon size={20} />}
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h3 className="text-lg font-bold text-white">{exp.title}</h3>
                          <span className="text-xs font-mono px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700 shrink-0 w-fit">
                            {exp.year_range}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-cyan-400 font-medium">{exp.company}</span>
                          <span className="text-xs px-2 py-0.5 bg-zinc-800/50 text-zinc-400 rounded border border-zinc-800 font-mono">
                            {exp.type}
                          </span>
                        </div>

                        {exp.description && (
                          <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
