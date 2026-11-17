"use client";

import { motion } from 'framer-motion';
import { Terminal, MapPin, Briefcase, GraduationCap, Video } from 'lucide-react';

const highlights = [
  {
    icon: <MapPin size={18} className="text-cyan-400" />,
    label: "Lokasi",
    value: "Jatinangor, Jawa Barat, Indonesia",
  },
  {
    icon: <GraduationCap size={18} className="text-cyan-400" />,
    label: "Pendidikan",
    value: "Lulusan SMK 2026, Jurusan TJKT",
  },
  {
    icon: <Briefcase size={18} className="text-cyan-400" />,
    label: "Fokus",
    value: "Fullstack web (Vibe Coding) dan desain visual (DKV)",
  },
  {
    icon: <Video size={18} className="text-cyan-400" />,
    label: "Konten",
    value: "Content Creator",
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
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-4 text-zinc-300 leading-relaxed"
        >
          <p>
            Saya Panji Wiguna, lulusan SMK jurusan Teknik Jaringan Komputer dan Telekomunikasi (TJKT) tahun 2026,
            tinggal di Jatinangor.
          </p>
          <p>
            Saya membuat situs web dan aplikasi dengan bantuan AI (vibe coding). Arsitektur, desain, pengujian,
            dan keamanan tetap saya tentukan dan periksa sendiri. Dasar desain saya datang dari Desain Komunikasi
            Visual (DKV), dan dasar jaringan saya dari TJKT.
          </p>
          <p>
            Selain itu saya membuat konten. Proyek terbaru saya adalah sistem informasi untuk Karang Taruna yang
            sudah berjalan di <a href="https://kartacintamulya.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">kartacintamulya.org</a>.
          </p>
        </motion.div>

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
