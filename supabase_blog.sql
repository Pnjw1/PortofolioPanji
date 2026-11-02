-- ============================================================
-- Blog Posts: tabel untuk artikel/blog
-- Jalankan di Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolio_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_url TEXT,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.portfolio_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read published posts for all"
ON public.portfolio_posts FOR SELECT USING (true);

CREATE POLICY "Allow insert for all - portfolio_posts"
ON public.portfolio_posts FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all - portfolio_posts"
ON public.portfolio_posts FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all - portfolio_posts"
ON public.portfolio_posts FOR DELETE USING (true);

-- ============================================================
-- Contoh Artikel
-- ============================================================

INSERT INTO public.portfolio_posts (title, slug, excerpt, content, tags, is_published, published_at) VALUES
(
  '5 Tips Belajar Web Development untuk Pemula',
  '5-tips-belajar-web-development',
  'Tips dan trik yang saya pelajari selama belajar web development secara otodidak.',
  '## Kenapa Web Development?

Web development adalah salah satu skill paling dicari di dunia teknologi saat ini. Berikut 5 tips yang membantu saya:

### 1. Mulai dari Dasar

Jangan langsung loncat ke framework. Pahami dulu **HTML**, **CSS**, dan **JavaScript** dasar. Ini pondasi yang harus kuat.

### 2. Buat Project Nyata

Teori saja tidak cukup. Coba buat project sederhana seperti:

- Landing page pribadi
- To-do list app
- Kalkulator

### 3. Gunakan Git dari Awal

`git init` adalah teman terbaik developer. Biasakan commit setiap perubahan penting:

```
git add .
git commit -m "feat: tambah fitur baru"
git push origin main
```

### 4. Ikut Komunitas

Bergabung dengan komunitas developer lokal atau online. Sharing pengalaman dan belajar dari orang lain itu sangat membantu!

### 5. Jangan Takut Gagal

Error adalah guru terbaik. Setiap bug yang kamu fix adalah pengalaman berharga. **Keep coding!** 🚀

> "The best way to learn programming is by programming." — Unknown',
  ARRAY['Web Dev', 'Tips', 'Pemula'],
  true,
  NOW()
),
(
  'Mengenal Cloud Computing: Apa dan Kenapa Penting?',
  'mengenal-cloud-computing',
  'Pengenalan singkat tentang cloud computing dan kenapa setiap developer perlu memahaminya.',
  '## Apa itu Cloud Computing?

Cloud computing adalah penggunaan server jarak jauh untuk menyimpan, mengelola, dan memproses data melalui internet.

### Jenis-jenis Cloud Service

1. **IaaS** (Infrastructure as a Service) — contoh: AWS EC2, Google Compute Engine
2. **PaaS** (Platform as a Service) — contoh: Vercel, Railway, Heroku
3. **SaaS** (Software as a Service) — contoh: Google Docs, Notion

### Kenapa Developer Perlu Belajar Cloud?

- Deploy aplikasi jadi lebih **mudah dan cepat**
- Bisa scale otomatis sesuai traffic
- Banyak layanan *gratis* untuk belajar (free tier)

### Tools yang Saya Gunakan

Untuk project portfolio ini, saya menggunakan:

- **Vercel** untuk hosting dan deployment
- **Supabase** sebagai backend (database + auth + storage)
- **GitHub** untuk version control

Semuanya ini bisa dipakai **gratis** untuk project personal! 💡

> Mulai dari yang gratis, tingkatkan seiring kebutuhan.',
  ARRAY['Cloud', 'Tutorial'],
  true,
  NOW()
);
