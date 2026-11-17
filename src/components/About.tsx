"use client";

import { MapPin, Briefcase, GraduationCap, Video } from 'lucide-react';

const highlights = [
  {
    icon: <MapPin size={18} className="text-cyan-400" />,
    label: "Lokasi",
    value: "Jatinangor, Sumedang, Jawa Barat",
  },
  {
    icon: <GraduationCap size={18} className="text-cyan-400" />,
    label: "Pendidikan",
    value: "SMKS PGRI Jatinangor — TJKT (2026)",
  },
  {
    icon: <Briefcase size={18} className="text-cyan-400" />,
    label: "Fokus",
    value: "Web Developer, DKV & Content Creator",
  },
  {
    icon: <Video size={18} className="text-cyan-400" />,
    label: "Media Sosial",
    value: "@info.cintamulya · @karta.cintamulya · @petacipajaran",
  },
];

const stats = [
  { num: "3+", label: "Tahun Coding" },
  { num: "5+", label: "Proyek" },
  { num: "10+", label: "Sertifikat" },
];

export default function About() {
  return (
    <section className="space-y-12">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Tentang Saya</h2>
        <div className="w-12 h-0.5 bg-cyan-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-4 text-zinc-300 leading-relaxed">
          <p>
            Saya Panji Wiguna, lulusan <strong className="text-white font-semibold">SMKS PGRI Jatinangor</strong> jurusan
            Teknik Jaringan Komputer dan Telekomunikasi (TJKT) tahun 2026, berdomisili di Jatinangor, Sumedang.
          </p>
          <p>
            Saya membangun aplikasi web modern menggunakan Next.js, React, TypeScript, Tailwind CSS, dan Supabase dengan
            dukungan perangkat AI (vibe coding) dalam proses pengembangan, mulai dari perancangan antarmuka, dashboard
            CMS, hingga penerapan SEO dan keamanan aplikasi.
          </p>
          <p>
            Di bidang <strong className="text-white font-semibold">Content Creation &amp; Desain Komunikasi Visual (DKV)</strong>,
            saya mengelola perencanaan konten, desain publikasi, dan komunikasi visual pada akun Instagram masyarakat dan
            organisasi seperti{' '}
            <a href="https://instagram.com/info.cintamulya" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">@info.cintamulya</a>,{' '}
            <a href="https://instagram.com/karta.cintamulya" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">@karta.cintamulya</a>, dan{' '}
            <a href="https://instagram.com/petacipajaran" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">@petacipajaran</a>,
            serta membangun situs <a href="https://kartacintamulya.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">kartacintamulya.org</a>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                {item.icon}
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{item.label}</span>
              </div>
              <p className="text-sm text-zinc-300 font-medium leading-snug">{item.value}</p>
            </div>
          ))}

          <div className="sm:col-span-2 p-5 border border-zinc-800 rounded-xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-cyan-400">{stat.num}</p>
                  <p className="text-xs text-zinc-500 font-mono mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
