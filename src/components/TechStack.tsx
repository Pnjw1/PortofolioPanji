"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Tech {
  name: string;
  icon_name: string;
  category: string;
  color_class: string;
  logo_url?: string | null;
}

// Keahlian tambahan sesuai CV ATS resmi jika belum ada di tabel Supabase
const cvFallbackSkills: Tech[] = [
  { name: 'Figma', icon_name: 'Layout', category: 'Desain & Kreatif (DKV)', color_class: 'text-cyan-400' },
  { name: 'Adobe Illustrator', icon_name: 'Layout', category: 'Desain & Kreatif (DKV)', color_class: 'text-cyan-400' },
  { name: 'Adobe Photoshop', icon_name: 'Layout', category: 'Desain & Kreatif (DKV)', color_class: 'text-cyan-400' },
  { name: 'Inkscape', icon_name: 'Layout', category: 'Desain & Kreatif (DKV)', color_class: 'text-cyan-400' },
  { name: 'Canva', icon_name: 'Layout', category: 'Desain & Kreatif (DKV)', color_class: 'text-cyan-400' },
  { name: 'Content Creation & Media Sosial', icon_name: 'Layout', category: 'Desain & Kreatif (DKV)', color_class: 'text-cyan-400' },
  { name: 'AI-Assisted Development', icon_name: 'Wand2', category: 'Perangkat AI & Vibe Coding', color_class: 'text-cyan-400' },
  { name: 'Prompt Engineering', icon_name: 'Wand2', category: 'Perangkat AI & Vibe Coding', color_class: 'text-cyan-400' },
  { name: 'Microsoft Office (Word, Excel, PowerPoint)', icon_name: 'Layout', category: 'Aplikasi Perkantoran', color_class: 'text-cyan-400' },
  { name: 'Google Workspace (Docs, Sheets, Slides)', icon_name: 'Layout', category: 'Aplikasi Perkantoran', color_class: 'text-cyan-400' },
];

export default function TechStack() {
  const [technologies, setTechnologies] = useState<Tech[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTech() {
      try {
        const { data, error } = await supabase
          .from('portfolio_tech')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const dbItems = data || [];
        const existingNames = new Set(dbItems.map((t) => t.name.toLowerCase()));
        const merged = [
          ...dbItems,
          ...cvFallbackSkills.filter((s) => !existingNames.has(s.name.toLowerCase())),
        ];
        setTechnologies(merged);
      } catch (err) {
        console.error('Error fetching tech stack:', err);
        setTechnologies(cvFallbackSkills);
      } finally {
        setLoading(false);
      }
    }
    fetchTech();
  }, []);

  // Kelompokkan berdasarkan kategori
  const grouped = technologies.reduce<Record<string, Tech[]>>((acc, item) => {
    const cat = item.category || 'Lainnya';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Teknologi &amp; Keahlian</h2>
        <div className="w-12 h-0.5 bg-cyan-500" />
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && technologies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div
              key={category}
              className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4"
            >
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
                {category}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {items.map((tech) => (
                  <li
                    key={tech.name}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-200"
                  >
                    {tech.logo_url && (
                      <span className="relative w-4 h-4 shrink-0">
                        <Image
                          src={tech.logo_url}
                          alt={tech.name}
                          fill
                          sizes="16px"
                          className="object-contain"
                        />
                      </span>
                    )}
                    <span>{tech.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
