"use client";

import { Briefcase, GraduationCap, Globe } from 'lucide-react';

const highlights = [
  {
    icon: <GraduationCap size={18} className="text-cyan-400" />,
    label: "Pendidikan",
    value: "SMKS PGRI Jatinangor — Teknik Jaringan Komputer dan Telekomunikasi (TJKT, 2026)",
  },
  {
    icon: <Briefcase size={18} className="text-cyan-400" />,
    label: "Peran",
    value: "Web Developer & Desainer Komunikasi Visual (DKV)",
  },
  {
    icon: <Globe size={18} className="text-cyan-400" />,
    label: "Proyek & Media",
    value: "kartacintamulya.org · @info.cintamulya · @karta.cintamulya · @petacipajaran",
  },
];

export default function About() {
  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Tentang Saya</h2>
        <div className="w-12 h-0.5 bg-cyan-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-4 text-zinc-300 leading-relaxed">
          <p>
            Saya Panji Wiguna, lulusan <strong className="text-white font-semibold">SMKS PGRI Jatinangor</strong> jurusan
            Teknik Jaringan Komputer dan Telekomunikasi (TJKT) tahun 2026, berdomisili di Jatinangor, Sumedang.
          </p>
          <p>
            Saya membangun aplikasi web menggunakan Next.js, React, TypeScript, Tailwind CSS, dan Supabase. Dalam metode
            kerja sehari-hari, saya memanfaatkan perangkat AI (AI-assisted development / vibe coding) untuk mempercepat
            penulisan kode, sementara arsitektur data, desain antarmuka, keamanan, dan pengujian tetap saya rancang
            serta periksa secara langsung.
          </p>
          <p>
            Kombinasi latar belakang teknis jaringan (TJKT) dan desain komunikasi visual (DKV) memungkinkan saya
            menangani proyek secara menyeluruh—mulai dari sistem informasi web seperti{' '}
            <a href="https://kartacintamulya.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">kartacintamulya.org</a>{' '}
            hingga perencanaan konten dan identitas visual pada akun informasi masyarakat{' '}
            <a href="https://instagram.com/info.cintamulya" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">@info.cintamulya</a>,{' '}
            <a href="https://instagram.com/karta.cintamulya" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">@karta.cintamulya</a>, dan{' '}
            <a href="https://instagram.com/petacipajaran" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">@petacipajaran</a>.
          </p>
        </div>

        {/* Tiga Kartu Ringkas: Pendidikan, Peran, Proyek & Media (Tanpa Kotak Statistik Klaim) */}
        <div className="lg:col-span-5 space-y-3.5">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-1.5">
                {item.icon}
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{item.label}</span>
              </div>
              <p className="text-sm text-zinc-200 font-medium leading-relaxed">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
