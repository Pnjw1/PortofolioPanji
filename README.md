# Panji Wiguna — Portfolio & Personal Website

Website portofolio dan blog pribadi Saya (**Panji Wiguna**) (Web Developer & Desainer Komunikasi Visual), dibangun menggunakan Next.js App Router, TypeScript, Tailwind CSS, dan Supabase.

**Live Website:** [https://www.panjiwiguna.site](https://www.panjiwiguna.site)

![Panji Wiguna Portfolio Preview](public/images/og-banner.png)

---

## Fitur Utama

- **Server-Side Rendering & SEO**: Beranda, halaman studi kasus proyek, dan artikel blog dirender di sisi server (`revalidate`) lengkap dengan metadata OpenGraph, JSON-LD `Person`, `robots.txt`, dan `sitemap.xml` dinamis.
- **Studi Kasus Proyek Terstruktur**: Setiap proyek memiliki halaman detail sendiri (`/projects/[slug]`) dengan struktur *Masalah*, *Peran Saya*, *Teknologi*, dan *Hasil*, beserta galeri gambar.
- **Blog Editorial & Komentar**: Halaman baca artikel (`/blog/[slug]`) dilengkapi *reading progress bar*, pengaturan jenis huruf (Sans/Serif) dan ukuran teks, dukungan embed audio/Spotify/YouTube, serta kolom komentar berbasis [Giscus](https://giscus.app/) (GitHub Discussions).
- **Formulir Kontak Terproteksi**: Dilengkapi validasi server, *honeypot*, Cloudflare Turnstile, notifikasi email via Nodemailer, serta *persistent rate limiting* di Supabase.
- **Admin CMS & Analytics Dashboard (`/admin`)**:
  - Dilindungi autentikasi Supabase melalui Next.js `proxy.ts` dan *rate limit* login.
  - Manajemen penuh untuk Proyek (termasuk editor Studi Kasus), Artikel Blog, Tech Stack, Pengalaman, Sertifikat, Testimoni, dan Kotak Masuk Pesan.
  - Dashboard analytics bawaan (*first-party*) yang menampilkan grafik kunjungan harian, pengunjung unik (hash harian tanpa menyimpan IP mentah), halaman terpopuler, sumber trafik, dan distribusi perangkat, serta terintegrasi dengan Google Analytics 4.
- **Keamanan & Header HTTP**: Dilengkapi `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `Content-Security-Policy-Report-Only`, dan `/.well-known/security.txt`.

---

## Performa & Audit (PageSpeed Insights — Mobile)

Hasil pengujian langsung pada `https://www.panjiwiguna.site` ([Verifikasi live di PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.panjiwiguna.site%2F)):

| Metrik | Skor |
| --- | --- |
| Performance | **98 / 100** |
| Accessibility | **100 / 100** |
| Best Practices | **100 / 100** |
| SEO | **100 / 100** |

---

## Tech Stack

| Kategori | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling & UI | Tailwind CSS v4, Framer Motion, Lucide Icons |
| Database & Auth | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Keamanan & Form | Cloudflare Turnstile, Nodemailer |
| Komentar & Analytics | Giscus, Google Tag / GA4, Vercel Analytics, First-Party Supabase Analytics |
| Deployment | Vercel |

---

## Struktur Direktori

```text
├── public/
│   ├── .well-known/security.txt
│   ├── images/                     # Aset visual & OG banner
│   ├── CV_Panji_Wiguna.pdf         # Dokumen CV siap unduh
│   └── favicon.ico                 # Favicon standar (ICO & PNG)
├── src/
│   ├── app/
│   │   ├── actions/                # Server Actions (autentikasi admin)
│   │   ├── admin/                  # CMS & Analytics Dashboard (terproteksi)
│   │   ├── api/
│   │   │   ├── analytics/track/    # Endpoint pelacakan kunjungan halaman
│   │   │   └── contact/            # Endpoint formulir kontak & email
│   │   ├── blog/                   # Daftar & halaman baca artikel
│   │   ├── certificates/           # Detail grup sertifikat
│   │   ├── projects/               # Halaman studi kasus proyek
│   │   ├── layout.tsx              # Root layout, metadata, JSON-LD, GA4
│   │   ├── page.tsx                # Beranda (Server Component)
│   │   ├── robots.ts               # Konfigurasi robots.txt
│   │   └── sitemap.ts              # Generator sitemap.xml dinamis
│   ├── components/                 # Komponen UI publik & dashboard admin
│   ├── lib/                        # Konfigurasi situs, Supabase client, parser
│   └── proxy.ts                    # Proteksi sesi rute /admin
└── next.config.ts                  # Konfigurasi image remote & security headers
```

---

## Menjalankan Secara Lokal

### 1. Clone & Instal Dependensi

```bash
git clone https://github.com/Pnjw1/PortofolioPanji.git
cd PortofolioPanji
npm install
```

### 2. Konfigurasi Environment Variables

Buat file `.env.local` di root proyek dan isi variabel berikut:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email SMTP (Nodemailer untuk formulir kontak)
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Opsional: Google Tag & GA4
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 4. Build Produksi

```bash
npm run build
npm run start
```

---

## Kontak

- **Website**: [https://www.panjiwiguna.site](https://www.panjiwiguna.site)
- **GitHub**: [https://github.com/Pnjw1](https://github.com/Pnjw1)
- **LinkedIn**: [https://www.linkedin.com/in/panji-wiguna-dev](https://www.linkedin.com/in/panji-wiguna-dev)
- **Instagram**: [https://www.instagram.com/panjiwiiguna](https://www.instagram.com/panjiwiiguna)
- **Email**: panjiwiguna98@gmail.com
