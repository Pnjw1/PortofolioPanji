import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — Panji Wiguna",
  description:
    "Syarat dan ketentuan penggunaan website portofolio dan blog Panji Wiguna (www.panjiwiguna.site).",
  alternates: {
    canonical: `${SITE.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-200 font-sans">
      <div className="container mx-auto max-w-3xl px-6 py-16 md:py-24 space-y-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-mono text-zinc-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-mono text-zinc-400 hover:text-cyan-400 underline underline-offset-4 transition-colors"
          >
            Kebijakan Privasi
          </Link>
        </div>

        <header className="space-y-3 border-b border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <FileText size={14} />
            <span>Dokumen Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Syarat &amp; Ketentuan
          </h1>
          <p className="text-sm text-zinc-400 font-mono">
            Terakhir diperbarui: 22 November 2026 · Berlaku untuk {SITE.url}
          </p>
        </header>

        <article className="space-y-8 text-sm md:text-base text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mengakses dan menggunakan website <strong className="text-zinc-100">www.panjiwiguna.site</strong>,
              Anda setuju untuk mematuhi Syarat &amp; Ketentuan ini. Apabila Anda tidak menyetujui bagian mana pun dari
              ketentuan ini, harap hentikan penggunaan situs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Hak Kekayaan Intelektual</h2>
            <p>
              Seluruh tulisan artikel blog, studi kasus proyek, desain antarmuka, dan materi visual asli yang
              dipublikasikan di situs ini merupakan milik <strong>Panji Wiguna</strong>, kecuali dinyatakan lain
              (seperti logo mitra/klien atau aset pihak ketiga). Anda diperbolehkan membagikan tautan artikel atau
              mengutip sebagian isi dengan mencantumkan sumber ke halaman asli, namun dilarang menyalin ulang seluruh
              konten untuk kepentingan komersial tanpa izin tertulis.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Konten Blog &amp; Batasan Tanggung Jawab</h2>
            <p>
              Artikel, tutorial teknis, dan catatan yang diterbitkan di bagian blog disediakan untuk tujuan informasi
              dan edukasi. Kami berusaha menjaga keakuratan setiap informasi, namun kami tidak bertanggung jawab atas
              kerugian langsung maupun tidak langsung yang timbul dari penerapan kode atau panduan di situs ini pada
              sistem Anda.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Komentar &amp; Interaksi Pengguna</h2>
            <p>
              Pengunjung yang meninggalkan komentar melalui Giscus atau mengirim pesan lewat formulir kontak wajib
              menggunakan bahasa yang sopan serta tidak mengirimkan spam, tautan berbahaya, atau konten yang melanggar
              hukum. Kami berhak menyembunyikan atau menghapus komentar yang melanggar ketentuan tersebut.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Tautan Eksternal</h2>
            <p>
              Situs ini memuat tautan ke website eksternal (seperti GitHub, LinkedIn, Instagram, situs proyek klien,
              YouTube, atau Spotify). Kami tidak memiliki kendali atas isi maupun kebijakan privasi situs eksternal
              tersebut.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Kontak</h2>
            <p>
              Untuk pertanyaan terkait Syarat &amp; Ketentuan, kerja sama, atau izin penggunaan konten, silakan hubungi{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
              >
                {SITE.email}
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
