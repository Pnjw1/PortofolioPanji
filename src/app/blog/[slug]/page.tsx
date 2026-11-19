import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleReader from '@/components/ArticleReader';
import { SITE } from '@/lib/site';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const supabase = await createSupabaseServerClient();
  const { data: post } = await supabase
    .from('portfolio_posts')
    .select('title, excerpt, cover_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) return { title: 'Artikel Tidak Ditemukan' };

  return {
    title: `${post.title} — Jurnal Panji Wiguna`,
    description: post.excerpt || post.title,
    alternates: {
      canonical: `${SITE.url}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: 'article',
      url: `${SITE.url}/blog/${slug}`,
      images: post.cover_url ? [{ url: post.cover_url, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: post.cover_url ? [post.cover_url] : [],
    },
  };
}

export const revalidate = 60;

export default async function BlogPostPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const supabase = await createSupabaseServerClient();
  const { data: post } = await supabase
    .from('portfolio_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) notFound();

  const { data: otherPosts } = await supabase
    .from('portfolio_posts')
    .select('title, slug, published_at, tags')
    .eq('is_published', true)
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(4);

  return <ArticleReader post={post} otherPosts={otherPosts || []} />;
}
