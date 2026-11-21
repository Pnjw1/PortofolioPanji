import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Panji Wiguna",
  description:
    "Kebijakan privasi untuk website portofolio dan blog Panji Wiguna (www.panjiwiguna.site), mencakup penggunaan formulir kontak, analytics, cookie, dan layanan pihak ketiga.",
  alternates: {
    canonical: `${SITE.url}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
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
            href="/terms"
            className="text-xs font-mono text-zinc-400 hover:text-cyan-400 underline underline-offset-4 transition-colors"
          >
            Syarat &amp; Ketentuan
          </Link>
        </div>

        <header className="space-y-3 border-b border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <Shield size={14} />
            <span>Dokumen Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-zinc-400 font-mono">
            Terakhir diperbarui: 22 November 2026 · Berlaku untuk {SITE.url}
          </p>
        </header>

        <article className="space-y-8 text-sm md:text-base text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Gambaran Umum</h2>
            <p>
              Kebijakan Privasi ini menjelaskan bagaimana <strong>Panji Wiguna</strong> (&ldquo;kami&rdquo;)
              mengumpulkan, menggunakan, dan melindungi informasi ketika Anda mengunjungi website portofolio dan blog{" "}
              <strong className="text-zinc-100">www.panjiwiguna.site</strong>. Dengan mengakses situs ini, Anda
              menyetujui praktik pengelolaan data yang dijelaskan pada halaman ini.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Informasi yang Anda Berikan Secara Langsung</h2>
            <p>
              Ketika Anda mengirimkan pesan melalui formulir kontak di situs ini, kami menyimpan data yang Anda isikan
              secara sukarela, meliputi:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-zinc-300">
              <li>Nama lengkap atau nama panggilan</li>
              <li>Alamat email</li>
              <li>Isi pesan yang Anda kirimkan</li>
            </ul>
            <p>
              Data tersebut hanya digunakan untuk membaca dan membalas pertanyaan, tawaran kerja, atau diskusi proyek
              dari Anda. Kami tidak pernah menjual, menyewakan, atau membagikan data kontak Anda kepada pihak ketiga
              untuk tujuan pemasaran.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Data Kunjungan &amp; Analytics</h2>
            <p>
              Untuk memahami halaman mana yang paling bermanfaat dan meningkatkan performa website, kami menggunakan
              layanan analitik berikut:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-zinc-300">
              <li>
                <strong className="text-zinc-100">Google Analytics 4 (GA4) &amp; Google Tag Manager</strong>: mengumpulkan
                data agregat seperti halaman yang dikunjungi, durasi kunjungan, jenis perangkat, dan wilayah secara umum
                menggunakan cookie sesuai kebijakan privasi Google.
              </li>
              <li>
                <strong className="text-zinc-100">Vercel Web Analytics</strong>: analitik performa dan kunjungan anonim
                tanpa pelacakan lintas situs.
              </li>
              <li>
                <strong className="text-zinc-100">Analitik Internal (First-Party)</strong>: mencatat alamat halaman yang
                dibuka, sumber rujukan (<em>referrer</em>), jenis perangkat, dan hash harian anonim (SHA-256) tanpa
                menyimpan alamat IP mentah pengunjung.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Iklan &amp; Cookie Pihak Ketiga (Google AdSense)</h2>
            <p>
              Situs ini dapat menampilkan iklan dari pihak ketiga, termasuk <strong className="text-zinc-100">Google AdSense</strong>,
              khususnya pada halaman artikel blog untuk mendukung biaya operasional domain dan pengembangan konten.
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-zinc-300">
              <li>
                Vendor pihak ketiga, termasuk Google, menggunakan cookie untuk menayangkan iklan berdasarkan kunjungan
                pengguna sebelumnya ke situs ini atau situs lain di internet.
              </li>
              <li>
                Penggunaan cookie iklan oleh Google memungkinkan Google dan mitranya menayangkan iklan yang relevan
                kepada pengunjung.
              </li>
              <li>
                Anda dapat menonaktifkan personalisasi iklan kapan saja melalui halaman{" "}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
                >
                  Pengaturan Iklan Google
                </a>{" "}
                atau menonaktifkan cookie melalui pengaturan browser Anda.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Layanan Pihak Ketiga Lainnya</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-zinc-300">
              <li>
                <strong className="text-zinc-100">Cloudflare Turnstile</strong>: digunakan pada formulir kontak untuk
                mencegah spam dan aktivitas bot otomatis.
              </li>
              <li>
                <strong className="text-zinc-100">Giscus (GitHub Discussions)</strong>: digunakan sebagai sistem komentar
                pada artikel blog. Jika Anda masuk untuk berkomentar, data autentikasi dan komentar dikelola langsung
                oleh GitHub sesuai Kebijakan Privasi GitHub.
              </li>
              <li>
                <strong className="text-zinc-100">Embed Media (YouTube / Spotify)</strong>: beberapa artikel menyertakan
                pemutar audio/video eksternal yang tunduk pada kebijakan privasi penyedia masing-masing saat diputar.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Keamanan &amp; Hak Pengguna</h2>
            <p>
              Kami menerapkan enkripsi HTTPS, pembatasan akses basis data (Row Level Security), dan header keamanan
              standar untuk melindungi data di situs ini. Anda berhak meminta penghapusan pesan atau data pribadi yang
              pernah Anda kirimkan melalui formulir kontak dengan menghubungi kami langsung.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Perubahan &amp; Kontak</h2>
            <p>
              Kebijakan Privasi ini dapat diperbarui sewaktu-waktu menyesuaikan perkembangan fitur situs. Jika Anda
              memiliki pertanyaan mengenai kebijakan ini, silakan hubungi kami melalui email di{" "}
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
