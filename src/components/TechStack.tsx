"use client";

import { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface Tech {
  id?: number;
  name: string;
  icon_name: string;
  category: string;
  color_class?: string;
  logo_url?: string | null;
}

// 8 Keahlian Utama sesuai spesifikasi Prioritas 4
const coreEightSkills: Tech[] = [
  { name: 'Next.js & React', icon_name: 'Globe', category: 'Frontend & Fullstack Web' },
  { name: 'TypeScript', icon_name: 'Code2', category: 'Pengembangan Web' },
  { name: 'Tailwind CSS', icon_name: 'Layers', category: 'Styling & UI Responsif' },
  { name: 'Supabase & PostgreSQL', icon_name: 'Database', category: 'Database, Auth & RLS' },
  { name: 'Figma', icon_name: 'PenTool', category: 'UI/UX Design & Prototyping' },
  { name: 'Adobe Illustrator & Photoshop', icon_name: 'Palette', category: 'Desain Grafis & Identitas Visual' },
  { name: 'Content Creation & Copywriting', icon_name: 'Video', category: 'Perencanaan Konten & Media Sosial' },
  { name: 'Jaringan (MikroTik, TCP/IP)', icon_name: 'Network', category: 'Infrastruktur & Konfigurasi TJKT' },
];

// Keahlian pendukung tambahan sesuai CV
const supportingFallbackSkills: Tech[] = [
  { name: 'Inkscape & Canva', icon_name: 'PenTool', category: 'Desain & Publikasi' },
  { name: 'Node.js & REST API', icon_name: 'Server', category: 'Backend' },
  { name: 'Git, GitHub & Vercel', icon_name: 'Terminal', category: 'Version Control & Deployment' },
  { name: 'Linux & Administrasi Server', icon_name: 'Server', category: 'Sistem & Jaringan' },
  { name: 'AI-Assisted Development & Prompting', icon_name: 'Sparkles', category: 'Metode Kerja' },
  { name: 'Microsoft Office & Google Workspace', icon_name: 'FileSpreadsheet', category: 'Aplikasi Perkantoran' },
];

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

export default function TechStack({ initialTechnologies = [] }: { initialTechnologies?: Tech[] }) {
  const [showSupporting, setShowSupporting] = useState(false);

  // Pasangkan logo dari database jika ada yang cocok dengan 8 keahlian utama
  const primaryEight = coreEightSkills.map((core) => {
    const dbMatch = initialTechnologies.find((d) => {
      const dn = d.name.toLowerCase();
      const cn = core.name.toLowerCase();
      return cn.includes(dn) || dn.includes(cn);
    });
    return {
      ...core,
      logo_url: dbMatch?.logo_url || null,
    };
  });

  // Kumpulkan keahlian pendukung (item dari DB yang belum masuk di 8 utama + supportingFallbackSkills)
  const coreKeywords = ['next', 'react', 'typescript', 'tailwind', 'supabase', 'postgres', 'figma', 'illustrator', 'photoshop', 'content', 'mikrotik', 'tcp'];
  const extraFromDb = initialTechnologies.filter((d) => {
    const dn = d.name.toLowerCase();
    return !coreKeywords.some((kw) => dn.includes(kw));
  });

  const existingSupportingNames = new Set(extraFromDb.map((d) => d.name.toLowerCase()));
  const supportingSkills = [
    ...extraFromDb,
    ...supportingFallbackSkills.filter((s) => {
      const sn = s.name.toLowerCase();
      for (const ex of existingSupportingNames) {
        if (sn.includes(ex) || ex.includes(sn)) return false;
      }
      return true;
    }),
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Keahlian Utama</h2>
        <div className="w-12 h-0.5 bg-cyan-500" />
        <p className="text-zinc-400 text-sm md:text-base max-w-xl">
          Delapan keahlian dan perangkat utama yang saya gunakan dalam pengembangan web, desain komunikasi visual, serta jaringan.
        </p>
      </div>

      {/* Grid 8 Keahlian Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {primaryEight.map((tech) => (
          <div
            key={tech.name}
            className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/40 transition-colors flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-cyan-400 shrink-0 overflow-hidden p-1.5">
              {tech.logo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={tech.logo_url}
                  alt={`Logo ${tech.name}`}
                  loading="lazy"
                  decoding="async"
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              ) : (
                getSkillIcon(tech)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-zinc-100 truncate">
                {tech.name}
              </h3>
              <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">
                {tech.category}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol Lihat Keahlian Pendukung Lainnya */}
      {supportingSkills.length > 0 && (
        <div className="space-y-4 pt-2">
          <button
            type="button"
            onClick={() => setShowSupporting((prev) => !prev)}
            aria-expanded={showSupporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs sm:text-sm font-mono text-zinc-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <span>
              {showSupporting
                ? 'Sembunyikan keahlian pendukung'
                : `Lihat keahlian pendukung lainnya (${supportingSkills.length})`}
            </span>
            {showSupporting ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showSupporting && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {supportingSkills.map((tech) => (
                <div
                  key={tech.id || tech.name}
                  className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 overflow-hidden p-1.5">
                    {tech.logo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={tech.logo_url}
                        alt={`Logo ${tech.name}`}
                        loading="lazy"
                        decoding="async"
                        className="max-w-full max-h-full w-auto h-auto object-contain"
                      />
                    ) : (
                      getSkillIcon(tech)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-zinc-200 truncate">{tech.name}</h4>
                    <p className="text-xs text-zinc-400 font-mono truncate">{tech.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
