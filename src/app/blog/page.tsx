import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, ArrowRight, ChevronLeft, ChevronRight, Eye, Headphones, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Jurnal & Catatan — Panji Wiguna',
  description: 'Esai, catatan proyek, dan pembahasan seputar pengembangan web, desain komunikasi visual, serta teknologi.',
  alternates: {
    canonical: 'https://panjiwiguna.vercel.app/blog',
  },
  openGraph: {
    title: 'Jurnal & Catatan — Panji Wiguna',
    description: 'Esai, catatan proyek, dan pembahasan seputar pengembangan web, desain komunikasi visual, serta teknologi.',
    url: 'https://panjiwiguna.vercel.app/blog',
    type: 'website',
    images: [
      {
        url: '/images/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'Jurnal & Catatan — Panji Wiguna',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jurnal & Catatan — Panji Wiguna',
    description: 'Esai, catatan proyek, dan pembahasan seputar pengembangan web, desain komunikasi visual, serta teknologi.',
    images: ['/images/og-banner.png'],
  },
};

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

function hasMusicCompanion(content?: string): boolean {
  if (!content) return false;
  return /\[(?:music|spotify|lagu|audio)\]\(([^)]+)\)/i.test(content);
}

function estimateReadingMinutes(content?: string): number {
  if (!content) return 1;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1'));

  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from('portfolio_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  const totalPosts = count || 0;
  const perPage = 9;
  const totalPages = Math.max(1, Math.ceil(totalPosts / perPage));
  const safePage = Math.min(currentPage, totalPages);

  const { data: posts } = await supabase
    .from('portfolio_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range((safePage - 1) * perPage, safePage * perPage - 1);

  const featuredPost = safePage === 1 && posts && posts.length > 0 ? posts[0] : null;
  const remainingPosts = featuredPost && posts ? posts.slice(1) : posts || [];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-14 md:py-20 space-y-12">
        {/* Navigasi Atas */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors font-mono text-xs sm:text-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            Publikasi Independen
          </span>
        </div>

        {/* Masthead Editorial */}
        <header className="border-b border-zinc-800 pb-8 space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Jurnal &amp; Catatan
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            Tulisan seputar pengembangan web, desain komunikasi visual, dan catatan di balik proyek yang saya kerjakan. Beberapa artikel dilengkapi lagu pilihan untuk menemani waktu baca Anda.
          </p>
        </header>

        {(!posts || posts.length === 0) ? (
          <div className="py-20 text-center border border-zinc-800/80 rounded-2xl bg-zinc-900/30 space-y-2">
            <p className="text-zinc-300 font-medium">Belum ada tulisan yang diterbitkan.</p>
            <p className="text-xs text-zinc-500 font-mono">Tulisan baru akan segera hadir di halaman ini.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Tulisan Utama (Featured Essay) di Halaman 1 */}
            {featuredPost && (
              <section>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group block rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/40 overflow-hidden transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12">
                    {featuredPost.cover_url && (
                      <div className="md:col-span-6 relative aspect-video md:aspect-auto md:min-h-[280px] overflow-hidden bg-zinc-950">
                        <Image
                          src={featuredPost.cover_url}
                          alt={featuredPost.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          priority
                        />
                      </div>
                    )}
                    <div
                      className={`${
                        featuredPost.cover_url ? 'md:col-span-6' : 'md:col-span-12'
                      } p-6 sm:p-8 flex flex-col justify-between space-y-5`}
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-500 text-zinc-950 font-bold">
                            Tulisan Terbaru
                          </span>
                          {hasMusicCompanion(featuredPost.content) && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded">
                              <Headphones size={12} />
                              Teman Musik
                            </span>
                          )}
                          {featuredPost.tags?.[0] && (
                            <span className="text-xs font-mono text-zinc-400">
                              #{featuredPost.tags[0]}
                            </span>
                          )}
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                          {featuredPost.title}
                        </h2>

                        {featuredPost.excerpt && (
                          <p className="text-sm sm:text-base text-zinc-400 line-clamp-3 leading-relaxed">
                            {featuredPost.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800/80 text-xs text-zinc-500 font-mono">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} />
                            {featuredPost.published_at
                              ? new Date(featuredPost.published_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} />
                            {estimateReadingMinutes(featuredPost.content)} mnt baca
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye size={12} />
                            {featuredPost.views || 0}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-cyan-400 font-sans font-semibold">
                          Baca Tulisan <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Daftar Tulisan Lainnya (Gaya Indeks Jurnal) */}
            {remainingPosts.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                  Arsip Tulisan
                </h2>
                <div className="divide-y divide-zinc-800/80 border-y border-zinc-800/80">
                  {remainingPosts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-zinc-500">
                          <span>
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </span>
                          <span>·</span>
                          <span>{estimateReadingMinutes(post.content)} mnt baca</span>
                          {hasMusicCompanion(post.content) && (
                            <>
                              <span>·</span>
                              <span className="inline-flex items-center gap-1 text-cyan-400">
                                <Headphones size={12} />
                                Teman Musik
                              </span>
                            </>
                          )}
                          {post.tags?.[0] && (
                            <>
                              <span>·</span>
                              <span className="text-zinc-400">#{post.tags[0]}</span>
                            </>
                          )}
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors leading-snug">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                      </div>

                      {post.cover_url && (
                        <div className="relative w-full sm:w-36 aspect-video sm:aspect-[4/3] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                          <Image
                            src={post.cover_url}
                            alt={post.title}
                            fill
                            sizes="150px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                {safePage > 1 && (
                  <Link
                    href={`/blog?page=${safePage - 1}`}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/blog?page=${pageNum}`}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-mono transition-colors ${
                      pageNum === safePage
                        ? 'bg-cyan-500 text-zinc-950 font-bold'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}

                {safePage < totalPages && (
                  <Link
                    href={`/blog?page=${safePage + 1}`}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
