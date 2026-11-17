"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  Headphones,
  Type,
  Copy,
  BookOpen,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import ViewCounter from '@/components/ViewCounter';

interface ArticlePost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  cover_url?: string | null;
  tags?: string[] | null;
  published_at?: string | null;
}

interface OtherPost {
  title: string;
  slug: string;
  published_at?: string | null;
  tags?: string[] | null;
}

interface ParsedContent {
  musicUrl: string | null;
  musicTitle: string | null;
  cleanBody: string;
}

// Mengekstrak tag musik di awal atau di dalam artikel:
// Format yang didukung:
// [music](https://open.spotify.com/track/...|Judul Lagu Opsional)
// [spotify](https://open.spotify.com/track/...)
// [lagu](https://.../audio.mp3|Judul Lagu)
export function extractMusicFromContent(rawContent: string): ParsedContent {
  const lines = (rawContent || '').split('\n');
  let musicUrl: string | null = null;
  let musicTitle: string | null = null;
  const remaining: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^\[(?:music|spotify|lagu|audio)\]\(([^)]+)\)$/i);
    if (match && !musicUrl) {
      const parts = match[1].split('|');
      musicUrl = parts[0].trim();
      musicTitle = parts[1] ? parts[1].trim() : null;
      continue;
    }
    remaining.push(line);
  }

  return {
    musicUrl,
    musicTitle,
    cleanBody: remaining.join('\n').trim(),
  };
}

// Mengubah link Spotify biasa menjadi URL embed resmi
function toSpotifyEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('spotify.com')) return null;
    // Hapus prefix bahasa seperti /intl-id/ jika ada
    const cleanPath = u.pathname.replace(/^\/intl-[a-z]+\//i, '/');
    if (cleanPath.startsWith('/embed/')) {
      return `https://open.spotify.com${cleanPath}?utm_source=generator&theme=0`;
    }
    const match = cleanPath.match(/^\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
    }
    return null;
  } catch {
    return null;
  }
}

function toYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function MusicCompanionCard({ url, title }: { url: string; title?: string | null }) {
  const spotifyEmbed = toSpotifyEmbedUrl(url);
  const youtubeEmbed = toYouTubeEmbedUrl(url);

  return (
    <div className="my-6 rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
          <Headphones size={15} />
          <span>Teman Membaca Artikel Ini</span>
        </div>
        {title && <span className="text-xs text-zinc-400 font-medium truncate">{title}</span>}
      </div>

      {spotifyEmbed ? (
        <iframe
          src={spotifyEmbed}
          width="100%"
          height="80"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={title || 'Spotify Music Player'}
          className="rounded-lg border-0"
        />
      ) : youtubeEmbed ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-800">
          <iframe
            src={youtubeEmbed}
            title={title || 'YouTube Audio/Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      ) : (
        <audio controls preload="metadata" className="w-full h-10">
          <source src={url} />
          Browser Anda tidak mendukung pemutar audio.
        </audio>
      )}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative group my-5 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/60 border-b border-zinc-800 text-xs font-mono text-zinc-500">
        <span>Kode</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? 'Tersalin' : 'Salin'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-cyan-300 font-mono leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-zinc-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-zinc-800/90 text-cyan-300 rounded text-[0.9em] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline underline-offset-4 decoration-cyan-500/40 hover:decoration-cyan-400 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

function readingTime(content: string) {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function ArticleReader({
  post,
  otherPosts,
}: {
  post: ArticlePost;
  otherPosts: OtherPost[];
}) {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [fontStyle, setFontStyle] = useState<'sans' | 'serif'>('sans');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [copiedShare, setCopiedShare] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const { musicUrl, musicTitle, cleanBody } = extractMusicFromContent(post.content);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
      } else {
        setProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      toast('Tautan artikel berhasil disalin!', 'success');
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // ignore
    }
  };

  const renderArticleBody = (body: string) => {
    const lines = body.split('\n');
    const elements: React.ReactNode[] = [];
    let firstParagraphRendered = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Inline music embed di tengah artikel jika penulis menaruh lebih dari satu lagu
      const inlineMusic = trimmed.match(/^\[(?:music|spotify|lagu|audio)\]\(([^)]+)\)$/i);
      if (inlineMusic) {
        const parts = inlineMusic[1].split('|');
        elements.push(<MusicCompanionCard key={i} url={parts[0].trim()} title={parts[1]?.trim()} />);
        continue;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-xl sm:text-2xl font-bold text-white mt-8 mb-3 tracking-tight font-sans">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4 tracking-tight font-sans border-b border-zinc-800/80 pb-2">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h2 key={i} className="text-2xl sm:text-3xl font-bold text-white mt-10 mb-4 tracking-tight font-sans">
            {line.slice(2)}
          </h2>
        );
      } else if (line.startsWith('```')) {
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(<CodeBlock key={i} code={codeLines.join('\n')} />);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={i} className="text-zinc-300 leading-relaxed ml-5 list-disc my-1">
            {renderInline(line.slice(2))}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={i} className="text-zinc-300 leading-relaxed ml-5 list-decimal my-1">
            {renderInline(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={i}
            className="my-6 pl-5 border-l-2 border-cyan-400 text-lg sm:text-xl text-zinc-200 italic leading-relaxed"
          >
            {renderInline(line.slice(2))}
          </blockquote>
        );
      } else if (/^!\[.*\]\(.*\)/.test(trimmed)) {
        const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
        if (match) {
          elements.push(
            <figure key={i} className="my-7">
              <div
                onClick={() => setLightboxImg(match[2])}
                className="relative w-full aspect-video rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden cursor-zoom-in"
              >
                <Image src={match[2]} alt={match[1] || post.title} fill sizes="100vw" className="object-contain" />
              </div>
              {match[1] && (
                <figcaption className="text-center text-xs text-zinc-500 font-mono mt-2.5">
                  {match[1]}
                </figcaption>
              )}
            </figure>
          );
        }
      } else if (trimmed === '---' || trimmed === '***') {
        elements.push(
          <div key={i} className="my-8 flex items-center justify-center gap-2 text-zinc-600">
            <span>•</span>
            <span>•</span>
            <span>•</span>
          </div>
        );
      } else if (trimmed === '') {
        elements.push(<div key={i} className="h-3" />);
      } else {
        const isFirst = !firstParagraphRendered;
        firstParagraphRendered = true;
        elements.push(
          <p
            key={i}
            className={`text-zinc-300 leading-[1.85] my-3 ${
              isFirst ? 'first-letter:text-4xl first-letter:font-bold first-letter:text-white first-letter:mr-1.5 first-letter:float-left first-letter:leading-none' : ''
            }`}
          >
            {renderInline(line)}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Reading Progress Bar di paling atas layar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
        <div
          className="h-full bg-cyan-400 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Lightbox Gambar */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxImg} alt="Preview" className="max-w-full max-h-[90vh] rounded-xl object-contain" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-14 md:py-20">
        {/* Navigasi Atas */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors font-mono text-xs sm:text-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Jurnal &amp; Catatan
          </Link>

          <div className="flex items-center gap-2">
            {/* Tombol Gaya Huruf (Sans / Serif) */}
            <button
              type="button"
              onClick={() => setFontStyle((prev) => (prev === 'sans' ? 'serif' : 'sans'))}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
              title="Ubah gaya huruf bacaan"
            >
              <BookOpen size={13} className="text-cyan-400" />
              <span>{fontStyle === 'sans' ? 'Sans' : 'Serif'}</span>
            </button>

            {/* Tombol Ukuran Teks */}
            <button
              type="button"
              onClick={() => setFontSize((prev) => (prev === 'normal' ? 'large' : 'normal'))}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1 cursor-pointer"
              title="Ubah ukuran huruf"
            >
              <Type size={13} className="text-cyan-400" />
              <span>{fontSize === 'normal' ? 'A' : 'A+'}</span>
            </button>

            {/* Tombol Bagikan */}
            <button
              type="button"
              onClick={handleShare}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/40 text-xs font-mono text-zinc-300 hover:text-cyan-400 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Salin tautan artikel"
            >
              {copiedShare ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
              <span>{copiedShare ? 'Tersalin' : 'Bagikan'}</span>
            </button>
          </div>
        </div>

        {/* Header Editorial Artikel */}
        <header className="space-y-5 pb-8 border-b border-zinc-800/80">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.18] tracking-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed font-normal">
              {post.excerpt}
            </p>
          )}

          {/* Byline Penulis (Gaya Publikasi Independen) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900 shrink-0">
                <Image
                  src="/images/panji-wiguna.png"
                  alt="Panji Wiguna"
                  fill
                  sizes="44px"
                  className="object-cover object-top"
                />
              </div>
              <div>
                <Link href="/" className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors">
                  Panji Wiguna
                </Link>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 font-mono mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} />
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {readingTime(cleanBody)} menit baca
                  </span>
                  <span>·</span>
                  <ViewCounter slug={post.slug} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Pemutar Musik Teman Baca (jika penulis menyertakan lagu) */}
        {musicUrl && <MusicCompanionCard url={musicUrl} title={musicTitle} />}

        {/* Gambar Sampul */}
        {post.cover_url && (
          <figure className="my-8">
            <div
              onClick={() => setLightboxImg(post.cover_url!)}
              className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 cursor-zoom-in"
            >
              <Image src={post.cover_url} alt={post.title} fill sizes="100vw" className="object-cover" priority />
            </div>
          </figure>
        )}

        {/* Isi Artikel */}
        <article
          className={`mt-8 ${fontStyle === 'serif' ? 'font-serif' : 'font-sans'} ${
            fontSize === 'large' ? 'text-lg sm:text-[19px]' : 'text-base sm:text-[17px]'
          }`}
        >
          {renderArticleBody(cleanBody)}
        </article>

        {/* Kartu Penulis di Akhir Tulisan */}
        <div className="mt-14 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900 shrink-0">
              <Image
                src="/images/panji-wiguna.png"
                alt="Panji Wiguna"
                fill
                sizes="48px"
                className="object-cover object-top"
              />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">Ditulis oleh</p>
              <p className="text-base font-bold text-white">Panji Wiguna</p>
              <p className="text-xs text-zinc-400">
                Web Developer, Content Creator &amp; Desainer Komunikasi Visual
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Share2 size={14} />
            <span>Bagikan Tulisan Ini</span>
          </button>
        </div>

        {/* Tulisan Lainnya */}
        {otherPosts && otherPosts.length > 0 && (
          <section className="mt-14 pt-10 border-t border-zinc-800 space-y-6">
            <h2 className="text-lg font-bold text-white">Baca Tulisan Lainnya</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-cyan-500/40 transition-colors group space-y-2"
                >
                  <h3 className="text-base font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-500">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : ''}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
