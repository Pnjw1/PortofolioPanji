import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, ArrowRight, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — Panji Wiguna',
  description: 'Tulisan seputar Web Development, Cloud Computing, dan Teknologi.',
  alternates: {
    canonical: 'https://panjiwiguna.vercel.app/blog',
  },
  openGraph: {
    title: 'Blog — Panji Wiguna',
    description: 'Tulisan seputar Web Development, Cloud Computing, dan Teknologi.',
    url: 'https://panjiwiguna.vercel.app/blog',
    type: 'website',
    images: [
      {
        url: '/images/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'Blog — Panji Wiguna',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Panji Wiguna',
    description: 'Tulisan seputar Web Development, Cloud Computing, dan Teknologi.',
    images: ['/images/og-banner.png'],
  },
};

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1'));

  const supabase = await createSupabaseServerClient();

  // Get total count
  const { count } = await supabase
    .from('portfolio_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  const totalPosts = count || 0;
  // Use 9 per page (3x3 on desktop, which shows 6 on mobile as 2x3)
  const perPage = 9;
  const totalPages = Math.max(1, Math.ceil(totalPosts / perPage));
  const safePage = Math.min(currentPage, totalPages);

  const { data: posts } = await supabase
    .from('portfolio_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range((safePage - 1) * perPage, safePage * perPage - 1);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-900/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[150px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16 md:py-24 space-y-10">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors font-mono text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Blog & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Artikel</span>
          </h1>
          <p className="text-zinc-400 max-w-xl">Tutorial, sharing pengalaman, dan insight seputar web development & teknologi.</p>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
        </div>

        {/* Posts grid */}
        {(!posts || posts.length === 0) ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg">Belum ada artikel. Nantikan konten menarik! ✍️</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {posts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-[#1e1e1e] border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300"
                >
                  {post.cover_url && (
                    <div className="relative w-full aspect-video overflow-hidden">
                      <Image src={post.cover_url} alt={post.title} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}

                  <div className="p-3 md:p-5 space-y-2 md:space-y-3 flex-1 flex flex-col">
                    <h2 className="text-sm md:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-xs md:text-sm text-zinc-400 line-clamp-2 hidden md:block">{post.excerpt}</p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Calendar size={10} className="md:w-3 md:h-3" />
                        <span className="hidden md:inline">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                        <span className="md:hidden">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                        </span>
                      </div>
                      {post.tags?.length > 0 && (
                        <span className="text-xs px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 font-mono hidden md:inline">
                          {post.tags[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-1">
                      <div className="flex items-center gap-1 text-xs md:text-sm text-cyan-400 font-medium">
                        Baca <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono">
                        <Eye size={12} />
                        {post.views || 0}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {safePage > 1 && (
                  <Link href={`/blog?page=${safePage - 1}`}
                    className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                    <ChevronLeft size={18} />
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <Link key={pageNum} href={`/blog?page=${pageNum}`}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-mono transition-colors ${
                      pageNum === safePage
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}>
                    {pageNum}
                  </Link>
                ))}

                {safePage < totalPages && (
                  <Link href={`/blog?page=${safePage + 1}`}
                    className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                    <ChevronRight size={18} />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
