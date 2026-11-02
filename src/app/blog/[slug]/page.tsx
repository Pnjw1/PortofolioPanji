import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Tag, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import ViewCounter from '@/components/ViewCounter';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: post } = await supabase
    .from('portfolio_posts')
    .select('title, excerpt, cover_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} — Blog Panji Wiguna`,
    description: post.excerpt || post.title,
    alternates: {
      canonical: `https://panjiwiguna.vercel.app/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: 'article',
      url: `https://panjiwiguna.vercel.app/blog/${slug}`,
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

// Simple markdown-like rendering
function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: any[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-xl font-bold text-white mt-4 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-white mt-6 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-3xl font-bold text-white mt-6 mb-2">{line.slice(2)}</h1>);
    }
    // Code blocks
    else if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-x-auto my-3">
          <code className="text-sm text-cyan-300 font-mono">{codeLines.join('\n')}</code>
        </pre>
      );
    }
    // List items
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={i} className="text-zinc-300 leading-relaxed ml-4 list-disc">
          {renderInline(line.slice(2))}
        </li>
      );
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={i} className="text-zinc-300 leading-relaxed ml-4 list-decimal">
          {renderInline(line.replace(/^\d+\.\s/, ''))}
        </li>
      );
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-cyan-500 pl-4 my-2 text-zinc-400 italic">
          {renderInline(line.slice(2))}
        </blockquote>
      );
    }
    // Image: ![alt](url)
    else if (/^!\[.*\]\(.*\)/.test(line)) {
      const match = line.match(/^!\[(.*?)\]\((.*?)\)/);
      if (match) {
        elements.push(
          <figure key={i} className="my-4">
            <div className="relative w-full aspect-video rounded-xl border border-zinc-800 overflow-hidden">
              <Image src={match[2]} alt={match[1]} fill sizes="100vw" className="object-contain" />
            </div>
            {match[1] && <figcaption className="text-center text-xs text-zinc-500 mt-2">{match[1]}</figcaption>}
          </figure>
        );
      }
    }
    // Empty line
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    }
    // Normal paragraph
    else {
      elements.push(<p key={i} className="text-zinc-300 leading-relaxed">{renderInline(line)}</p>);
    }
  }

  return elements;
}

// Inline formatting: **bold**, *italic*, `code`, [link](url)
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 bg-zinc-800 text-cyan-400 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{linkMatch[1]}</a>;
    }
    return part;
  });
}

// Estimate reading time
function readingTime(content: string) {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: post } = await supabase
    .from('portfolio_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) notFound();

  // Fetch other posts for sidebar
  const { data: otherPosts } = await supabase
    .from('portfolio_posts')
    .select('title, slug, published_at, tags')
    .eq('is_published', true)
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(5);

  // Collect all unique tags
  const allTags = [...new Set([
    ...(post.tags || []),
    ...(otherPosts || []).flatMap((p: any) => p.tags || [])
  ])];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-900/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[150px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16 md:py-24">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors font-mono text-sm group mb-8">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Semua Artikel
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Main Article */}
          <article className="flex-1 min-w-0 space-y-6">
            {/* Cover */}
            {post.cover_url && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-800">
                <Image src={post.cover_url} alt={post.title} fill sizes="100vw" className="object-contain" />
              </div>
            )}

            {/* Header */}
            <header className="space-y-3">
              <h1 className="text-2xl md:text-4xl font-bold leading-tight">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {readingTime(post.content)} menit baca
                </div>
                <ViewCounter slug={slug} />
              </div>

              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="text-xs px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
            </header>

            {/* Content */}
            <div className="prose-custom space-y-1">
              {renderContent(post.content)}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Link href="/blog" className="text-cyan-400 hover:underline text-sm font-mono flex items-center gap-1">
                <ArrowLeft size={14} /> Lihat artikel lainnya
              </Link>
              <p className="text-xs text-zinc-600">Ditulis oleh Panji Wiguna</p>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Author Card */}
            <div className="bg-[#1e1e1e] border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden p-1">
                  <Image src="/images/favicon.svg" alt="Logo" width={40} height={40} className="rounded-full" />
                </div>
                <div>
                  <p className="font-semibold text-white">Panji Wiguna</p>
                  <p className="text-xs text-zinc-500">DKV & Fullstack Developer</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Visual Communication Design (DKV) & Fullstack Developer based in Jatinangor, Indonesia.
              </p>
              <Link href="/" className="block text-xs text-cyan-400 hover:underline font-mono">
                Lihat Portfolio →
              </Link>
            </div>

            {/* Recent Posts */}
            {otherPosts && otherPosts.length > 0 && (
              <div className="bg-[#1e1e1e] border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Artikel Lainnya</h3>
                <div className="space-y-3">
                  {otherPosts.map((p: any) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`}
                      className="block group">
                      <p className="text-sm text-zinc-300 group-hover:text-cyan-400 transition-colors line-clamp-2 font-medium">
                        {p.title}
                      </p>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {p.published_at ? new Date(p.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="bg-[#1e1e1e] border border-zinc-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag: string) => (
                    <span key={tag} className="text-xs px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
