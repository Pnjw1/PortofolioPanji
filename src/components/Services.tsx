"use client";

import { Globe, Palette, Video, ArrowRight } from 'lucide-react';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  icon: React.ReactNode;
  // Rentang harga dikosongkan sampai pemilik menentukan angka resmi di data
  priceRange?: string;
}

const services: ServiceItem[] = [
  {
    id: 'web-development',
    title: 'Pembuatan Website & Aplikasi Web',
    description:
      'Pengembangan situs profil organisasi, landing page, portal informasi, hingga aplikasi web kustom lengkap dengan dashboard admin (CMS) dan database.',
    deliverables: [
      'Antarmuka responsif (Next.js, React, Tailwind CSS)',
      'Dashboard CMS & autentikasi aman (Supabase PostgreSQL)',
      'Optimasi SEO teknis, kecepatan muat, dan deployment',
    ],
    icon: <Globe size={22} className="text-cyan-400" />,
  },
  {
    id: 'dkv-uiux',
    title: 'Desain Komunikasi Visual & UI/UX',
    description:
      'Perancangan tampilan antarmuka aplikasi/web di Figma serta materi identitas visual dan publikasi grafis yang rapi dan konsisten.',
    deliverables: [
      'Wireframe & prototipe UI/UX interaktif (Figma)',
      'Desain identitas visual, poster, dan materi publikasi',
      'Ilustrasi vektor & tata letak (Illustrator, Photoshop, Inkscape)',
    ],
    icon: <Palette size={22} className="text-cyan-400" />,
  },
  {
    id: 'content-creation',
    title: 'Content Creation & Media Sosial',
    description:
      'Pengelolaan konten informasi dan visual media sosial untuk komunitas, organisasi, atau brand—mulai dari perencanaan ide hingga publikasi.',
    deliverables: [
      'Perencanaan kalender konten & penulisan copy/caption',
      'Desain feed, carousel, dan dokumentasi kegiatan',
      'Publikasi & penyampaian informasi terstruktur',
    ],
    icon: <Video size={22} className="text-cyan-400" />,
  },
];

export default function Services() {
  const handleRequestQuote = (serviceTitle: string) => {
    window.dispatchEvent(
      new CustomEvent('prefill-contact', {
        detail: { service: serviceTitle },
      })
    );
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Layanan</h2>
        <div className="w-12 h-0.5 bg-cyan-500" />
        <p className="text-zinc-400 text-sm md:text-base max-w-xl">
          Layanan kolaborasi dan proyek freelance yang saya kerjakan. Pilih layanan untuk mendiskusikan kebutuhan dan meminta penawaran.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                {srv.icon}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {srv.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <ul className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs sm:text-sm text-zinc-300">
                {srv.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold leading-5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-800/80 space-y-3">
              {srv.priceRange && (
                <p className="text-xs font-mono text-zinc-400">{srv.priceRange}</p>
              )}
              <button
                type="button"
                onClick={() => handleRequestQuote(srv.title)}
                className="w-full py-2.5 px-4 rounded-lg bg-zinc-950 border border-zinc-700 hover:border-cyan-500 text-zinc-100 hover:text-cyan-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Minta Penawaran</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
