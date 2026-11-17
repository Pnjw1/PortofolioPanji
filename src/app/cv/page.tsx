"use client";

import Link from 'next/link';
import { ArrowLeft, Printer, Mail, Phone, Globe, Github, Linkedin } from 'lucide-react';
import { SITE } from '@/lib/site';

export default function CVPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 py-12 px-4 sm:px-6 print:bg-white print:text-black print:p-0">
      {/* Toolbar (disembunyikan saat cetak PDF) */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between gap-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono text-zinc-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Portofolio
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-zinc-950 font-semibold text-sm rounded-lg hover:bg-cyan-400 transition-colors cursor-pointer"
        >
          <Printer size={16} />
          Cetak / Simpan PDF
        </button>
      </div>

      {/* Lembar CV */}
      <article className="max-w-3xl mx-auto bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-10 space-y-8 print:bg-white print:border-0 print:rounded-none print:p-0 print:space-y-5">
        {/* Header */}
        <header className="border-b border-zinc-800 pb-6 space-y-3 print:border-zinc-300">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white print:text-black">
            PANJI WIGUNA
          </h1>
          <p className="text-base sm:text-lg text-cyan-400 font-medium print:text-zinc-800">
            Fullstack Web Developer (Vibe Coding), Content Creator &amp; Visual Communication Designer (DKV)
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-zinc-400 pt-1 print:text-zinc-700">
            <span>Jatinangor, Sumedang, Jawa Barat</span>
            <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-1.5 hover:text-white print:text-black">
              <Mail size={13} />
              {SITE.email}
            </a>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white print:text-black">
              <Phone size={13} />
              +62 888-0940-9219
            </a>
            <a href={SITE.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white print:text-black">
              <Globe size={13} />
              panjiwiguna.vercel.app
            </a>
            <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white print:text-black">
              <Linkedin size={13} />
              linkedin.com/in/panji-wiguna-dev
            </a>
            <a href={SITE.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white print:text-black">
              <Github size={13} />
              github.com/Pnjw1
            </a>
          </div>
        </header>

        {/* Ringkasan */}
        <section className="space-y-2">
          <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-400 font-bold print:text-black">
            Ringkasan Profesional
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed print:text-zinc-800">
            Lulusan Teknik Jaringan Komputer dan Telekomunikasi (TJKT) yang berfokus sebagai Fullstack Web Developer
            (Vibe Coding), Content Creator, dan Visual Communication Designer (DKV). Mengembangkan aplikasi web modern
            menggunakan ekosistem Next.js, React, TypeScript, Tailwind CSS, dan Supabase dengan pendekatan AI-assisted
            software engineering. Didukung pemahaman desain antarmuka pengguna (UI/UX), produksi konten digital, dasar
            infrastruktur jaringan TJKT, serta penerapan keamanan dan aksesibilitas web.
          </p>
        </section>

        {/* Keahlian */}
        <section className="space-y-3">
          <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-400 font-bold print:text-black">
            Keahlian Utama
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-300 print:text-zinc-800">
            <div>
              <h3 className="font-semibold text-white mb-1 print:text-black">Web Development &amp; Vibe Coding</h3>
              <p className="text-zinc-400 leading-relaxed print:text-zinc-700">
                Next.js (App Router), React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Supabase (PostgreSQL,
                Auth, RLS), REST API, Git/GitHub, Vercel, AI-Assisted Engineering &amp; Prompt Engineering.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1 print:text-black">Desain Visual (DKV) &amp; Content Creation</h3>
              <p className="text-zinc-400 leading-relaxed print:text-zinc-700">
                UI/UX Design, Visual Communication Design, Layouting, Brand Identity, Produksi Konten Digital &amp; Media
                Sosial.
              </p>
            </div>
            <div className="sm:col-span-2">
              <h3 className="font-semibold text-white mb-1 print:text-black">Jaringan &amp; Infrastruktur (TJKT)</h3>
              <p className="text-zinc-400 leading-relaxed print:text-zinc-700">
                Konfigurasi Router &amp; Switch (MikroTik), TCP/IP Networking, Troubleshooting Jaringan, Administrasi
                Sistem Dasar.
              </p>
            </div>
          </div>
        </section>

        {/* Pengalaman */}
        <section className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-400 font-bold print:text-black">
            Pengalaman Proyek &amp; Organisasi
          </h2>

          <div className="space-y-4 text-sm text-zinc-300 print:text-zinc-800">
            <div>
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-semibold text-white print:text-black">
                  Fullstack Web Developer, Visual Designer &amp; Content Creator — Freelance / Proyek Independen
                </h3>
                <span className="text-xs font-mono text-zinc-400 print:text-zinc-600">2024 — Sekarang</span>
              </div>
              <ul className="list-disc list-inside text-zinc-400 space-y-1 mt-1.5 leading-relaxed print:text-zinc-700">
                <li>
                  Membangun aplikasi web Sistem Informasi Karang Taruna (<span className="font-mono">kartacintamulya.org</span>)
                  dan situs portofolio dinamis berbasis Next.js, TypeScript, dan Supabase PostgreSQL.
                </li>
                <li>
                  Merancang CMS Admin terproteksi autentikasi sesi dan Row Level Security (RLS) untuk pengelolaan artikel
                  blog, proyek, sertifikat, pengalaman, dan pesan kontak.
                </li>
                <li>
                  Menerapkan optimasi SEO (Sitemap dinamis, Schema.org JSON-LD, OpenGraph) serta lapisan keamanan aplikasi
                  web (Security Headers, Rate Limiting, sanitasi output).
                </li>
              </ul>
            </div>

            <div>
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-semibold text-white print:text-black">
                  Divisi Teknologi Informasi &amp; Komunikasi — Organisasi &amp; Komunitas
                </h3>
                <span className="text-xs font-mono text-zinc-400 print:text-zinc-600">2024 — 2026</span>
              </div>
              <ul className="list-disc list-inside text-zinc-400 space-y-1 mt-1.5 leading-relaxed print:text-zinc-700">
                <li>
                  Mengelola desain komunikasi visual, publikasi digital, serta pembuatan konten kreatif untuk kegiatan
                  organisasi dan komunitas.
                </li>
                <li>
                  Menangani konfigurasi dan pemeliharaan jaringan lokal serta perangkat pendukung operasional kegiatan.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pendidikan */}
        <section className="space-y-2">
          <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-400 font-bold print:text-black">
            Pendidikan
          </h2>
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <div>
              <h3 className="font-semibold text-white print:text-black">
                Sekolah Menengah Kejuruan (SMK) — Teknik Jaringan Komputer dan Telekomunikasi (TJKT)
              </h3>
              <p className="text-zinc-400 print:text-zinc-700">
                Fokus: Administrasi Jaringan, Pemrograman Web, dan Desain Komunikasi Visual.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 print:text-zinc-600">Lulus 2026</span>
          </div>
        </section>

        {/* Sertifikasi */}
        <section className="space-y-2">
          <h2 className="text-sm font-mono uppercase tracking-wider text-cyan-400 font-bold print:text-black">
            Sertifikasi
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed print:text-zinc-700">
            Sertifikasi Dicoding Indonesia, HP LIFE Certification, dan Google Developer Profile dapat dilihat serta
            diverifikasi langsung di{' '}
            <Link href="/#certificates" className="text-cyan-400 hover:underline print:text-black">
              panjiwiguna.vercel.app/#certificates
            </Link>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
