"use client";

import { useState, useEffect } from 'react';
import {
  Code2,
  Database,
  Globe,
  Layers,
  Network,
  Palette,
  PenTool,
  Server,
  Sparkles,
  Terminal,
  Video,
  FileSpreadsheet,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Tech {
  name: string;
  icon_name: string;
  category: string;
  color_class: string;
  logo_url?: string | null;
  role?: string;
}

const curatedSkills: Tech[] = [
  // Pengembangan Web
  { name: 'Next.js', icon_name: 'Globe', category: 'Pengembangan Web', color_class: 'text-cyan-400', role: 'Fullstack Framework' },
  { name: 'React.js', icon_name: 'Code2', category: 'Pengembangan Web', color_class: 'text-cyan-400', role: 'UI Library' },
  { name: 'TypeScript', icon_name: 'Code2', category: 'Pengembangan Web', color_class: 'text-cyan-400', role: 'Type-Safe JS' },
  { name: 'Tailwind CSS', icon_name: 'Layers', category: 'Pengembangan Web', color_class: 'text-cyan-400', role: 'Utility Styling' },
  { name: 'Supabase & PostgreSQL', icon_name: 'Database', category: 'Pengembangan Web', color_class: 'text-cyan-400', role: 'Database, Auth & RLS' },
  { name: 'Node.js & REST API', icon_name: 'Server', category: 'Pengembangan Web', color_class: 'text-cyan-400', role: 'Backend Runtime' },
  { name: 'Git, GitHub & Vercel', icon_name: 'Terminal', category: 'Pengembangan Web', color_class: 'text-cyan-400', role: 'Version Control & Deploy' },

  // Desain & Kreatif (DKV)
  { name: 'Figma', icon_name: 'PenTool', category: 'Desain & Kreatif (DKV)', color_class: 'text-cyan-400', role: 'UI/UX & Prototyping' },
  { name: 'Adobe Illustrator', icon_name: 'Palette', category: 'Desain & Kreatif (DKV)', color_class: 'text-cyan-400', role: 'Vector & Brand Identity' },
  { name: 'Adobe Photoshop', icon_name: 'Palette', category: 'Desain & Kreatif (DKV)', color_class: 'text-cyan-400', role: 'Image Manipulation' },
  { name: 'Inkscape & Canva', icon_name: 'PenTool', category: 'Desain & Kreatif (DKV)', color_class: 'text-cyan-400', role: 'Layout & Publikasi' },
  { name: 'Content Creation & Media Sosial', icon_name: 'Video', category: 'Desain & Kreatif (DKV)', color_class: 'text-cyan-400', role: 'Perencanaan, Copy & Visual' },

  // Jaringan & TI (TJKT)
  { name: 'MikroTik (Router & Switch)', icon_name: 'Network', category: 'Jaringan & TI (TJKT)', color_class: 'text-cyan-400', role: 'Konfigurasi & Manajemen' },
  { name: 'TCP/IP & Troubleshooting', icon_name: 'Network', category: 'Jaringan & TI (TJKT)', color_class: 'text-cyan-400', role: 'Infrastruktur Jaringan' },
  { name: 'Linux & Server Dasar', icon_name: 'Server', category: 'Jaringan & TI (TJKT)', color_class: 'text-cyan-400', role: 'Administrasi Sistem' },

  // AI & Produktivitas
  { name: 'AI-Assisted Development', icon_name: 'Sparkles', category: 'AI & Produktivitas', color_class: 'text-cyan-400', role: 'Vibe Coding & Testing' },
  { name: 'Prompt Engineering', icon_name: 'Sparkles', category: 'AI & Produktivitas', color_class: 'text-cyan-400', role: 'Workflow & Otomasi' },
  { name: 'Microsoft Office Suite', icon_name: 'FileSpreadsheet', category: 'AI & Produktivitas', color_class: 'text-cyan-400', role: 'Word, Excel, PowerPoint, Outlook' },
  { name: 'Google Workspace', icon_name: 'FileSpreadsheet', category: 'AI & Produktivitas', color_class: 'text-cyan-400', role: 'Docs, Sheets, Slides' },
];

function normalizeCategory(raw: string): string {
  const lower = (raw || '').toLowerCase();
  if (lower.includes('front') || lower.includes('back') || lower.includes('style') || lower.includes('web') || lower.includes('script')) {
    return 'Pengembangan Web';
  }
  if (lower.includes('dkv') || lower.includes('desain') || lower.includes('design') || lower.includes('kreatif') || lower.includes('media')) {
    return 'Desain & Kreatif (DKV)';
  }
  if (lower.includes('net') || lower.includes('jaringan') || lower.includes('devops') || lower.includes('os') || lower.includes('tjkt')) {
    return 'Jaringan & TI (TJKT)';
  }
  if (lower.includes('ai') || lower.includes('kantor') || lower.includes('office') || lower.includes('produk')) {
    return 'AI & Produktivitas';
  }
  return raw || 'Pengembangan Web';
}

function getSkillIcon(item: Tech) {
  const n = item.name.toLowerCase();
  if (n.includes('figma') || n.includes('inkscape') || n.includes('canva')) return <PenTool size={18} />;
  if (n.includes('adobe') || n.includes('illustrator') || n.includes('photoshop') || n.includes('dkv')) return <Palette size={18} />;
  if (n.includes('content') || n.includes('video') || n.includes('media')) return <Video size={18} />;
  if (n.includes('mikrotik') || n.includes('tcp') || n.includes('network') || n.includes('jaringan')) return <Network size={18} />;
  if (n.includes('supabase') || n.includes('postgres') || n.includes('database')) return <Database size={18} />;
  if (n.includes('ai') || n.includes('prompt')) return <Sparkles size={18} />;
  if (n.includes('office') || n.includes('workspace') || n.includes('excel')) return <FileSpreadsheet size={18} />;
  if (n.includes('linux') || n.includes('node') || n.includes('docker')) return <Server size={18} />;
  if (n.includes('git') || n.includes('python') || n.includes('terminal')) return <Terminal size={18} />;
  if (n.includes('tailwind') || n.includes('css')) return <Layers size={18} />;
  if (n.includes('next')) return <Globe size={18} />;
  return <Code2 size={18} />;
}

export default function TechStack() {
  const [technologies, setTechnologies] = useState<Tech[]>(curatedSkills);
  const [activeTab, setActiveTab] = useState<string>('Semua');

  useEffect(() => {
    async function fetchTech() {
      try {
        const { data, error } = await supabase
          .from('portfolio_tech')
          .select('*')
          .order('created_at', { ascending: false });
        if (error || !data || data.length === 0) return;

        const mappedDb: Tech[] = data.map((d) => ({
          name: d.name,
          icon_name: d.icon_name || 'Code2',
          category: normalizeCategory(d.category),
          color_class: 'text-cyan-400',
          logo_url: d.logo_url,
          role: d.category,
        }));

        const seen = new Set(mappedDb.map((t) => t.name.toLowerCase()));
        const merged = [
          ...mappedDb,
          ...curatedSkills.filter((c) => {
            const key = c.name.toLowerCase();
            // Hindari duplikat seperti "Supabase" vs "Supabase & PostgreSQL"
            for (const s of seen) {
              if (key.includes(s) || s.includes(key)) return false;
            }
            return true;
          }),
        ];
        setTechnologies(merged);
      } catch {
        // Fallback ke curatedSkills
      }
    }
    fetchTech();
  }, []);

  const categories = ['Semua', ...Array.from(new Set(technologies.map((t) => t.category)))];
  const visible = activeTab === 'Semua' ? technologies : technologies.filter((t) => t.category === activeTab);

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Teknologi &amp; Keahlian</h2>
          <div className="w-12 h-0.5 bg-cyan-500" />
          <p className="text-zinc-400 text-sm md:text-base max-w-xl">
            Perangkat dan keahlian yang saya gunakan untuk membangun aplikasi web, merancang identitas visual, serta mengelola konten dan jaringan.
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800/80 pb-4">
        {categories.map((cat) => {
          const count = cat === 'Semua' ? technologies.length : technologies.filter((t) => t.category === cat).length;
          const isActive = activeTab === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveTab(cat)}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-zinc-950 font-semibold'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {visible.map((tech) => (
          <div
            key={tech.name}
            className="group p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/90 hover:border-cyan-500/40 hover:bg-zinc-900 transition-colors flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-lg bg-zinc-950 border border-zinc-800 group-hover:border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 overflow-hidden p-1.5 transition-colors">
              {tech.logo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={tech.logo_url}
                  alt={tech.name}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              ) : (
                getSkillIcon(tech)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-white truncate">
                {tech.name}
              </h3>
              <p className="text-xs text-zinc-500 font-mono truncate mt-0.5">
                {tech.role || tech.category}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
