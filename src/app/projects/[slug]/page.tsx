import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, AlertCircle, UserCheck, Cpu, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { buildCaseStudy, getProjectSlug, type ProjectRecord } from '@/lib/project-case-studies';
import ProjectGallery from '@/components/ProjectGallery';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

async function findProjectBySlug(rawSlug: string): Promise<ProjectRecord | null> {
  const slug = decodeURIComponent(rawSlug).trim();
  const supabase = await createSupabaseServerClient();

  // 1. Cari langsung berdasarkan kolom slug
  const { data: exactMatch } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle();

  if (exactMatch) return exactMatch;

  // 2. Jika proyek di DB belum punya kolom slug terisi, cocokkan dari slug otomatis judulnya
  const { data: allProjects } = await supabase
    .from('portfolio_projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (!allProjects) return null;

  return (
    allProjects.find(
      (p) => getProjectSlug(p).toLowerCase() === slug.toLowerCase()
    ) || null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await findProjectBySlug(slug);

  if (!project) {
    return { title: 'Studi Kasus Tidak Ditemukan — Panji Wiguna' };
  }

  const caseStudy = buildCaseStudy(project);
  const canonicalSlug = getProjectSlug(project);

  return {
    title: `Studi Kasus: ${project.title} — Panji Wiguna`,
    description: caseStudy.oneLineResult,
    alternates: {
      canonical: `https://panjiwiguna.vercel.app/projects/${encodeURIComponent(canonicalSlug)}`,
    },
    openGraph: {
      title: `Studi Kasus: ${project.title} — Panji Wiguna`,
      description: caseStudy.oneLineResult,
      url: `https://panjiwiguna.vercel.app/projects/${encodeURIComponent(canonicalSlug)}`,
      type: 'article',
      images: project.image_url ? [{ url: project.image_url, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await findProjectBySlug(slug);

  if (!project) notFound();

  const supabase = await createSupabaseServerClient();
  const projectSlug = project.slug || getProjectSlug(project);

  const { data: imageData } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_slug', projectSlug)
    .order('sort_order', { ascending: true });

  const images = imageData || [];
  const caseStudy = buildCaseStudy(project);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16 md:py-24 space-y-10">
        {/* Tombol Kembali */}
        <div>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors font-mono text-xs sm:text-sm group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform motion-reduce:transition-none"
            />
            Kembali ke Proyek Pilihan
          </Link>
        </div>

        {/* Header Studi Kasus */}
        <header className="space-y-4 border-b border-zinc-800 pb-8">
          <p className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            Studi Kasus Proyek
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                {project.title}
              </h1>
              <p className="text-zinc-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                {caseStudy.oneLineResult}
              </p>
            </div>

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold rounded-lg transition-colors text-sm shrink-0 w-fit"
              >
                <ExternalLink size={16} />
                <span>Kunjungi Situs Live</span>
              </a>
            )}
          </div>
        </header>

        {/* Gambar Utama & Galeri */}
        <ProjectGallery
          coverUrl={project.image_url}
          coverAlt={project.alt_text || `Tampilan proyek ${project.title}`}
          images={images}
        />

        {/* Struktur 4 Bagian Studi Kasus: Masalah, Peran Saya, Teknologi, Hasil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* 1. Masalah */}
          <section className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
              <AlertCircle size={15} />
              <h2>1. Masalah &amp; Latar Belakang</h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              {caseStudy.problem}
            </p>
          </section>

          {/* 2. Peran Saya */}
          <section className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
              <UserCheck size={15} />
              <h2>2. Peran Saya</h2>
            </div>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              {caseStudy.role}
            </p>
          </section>

          {/* 3. Teknologi */}
          <section className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
              <Cpu size={15} />
              <h2>3. Teknologi yang Digunakan</h2>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {caseStudy.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/30 rounded-md border border-cyan-900/50"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* 4. Hasil */}
          <section className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
              <CheckCircle2 size={15} />
              <h2>4. Hasil &amp; Dampak</h2>
            </div>
            <ul className="space-y-2 text-sm sm:text-base text-zinc-300 leading-relaxed list-disc list-inside">
              {caseStudy.results.map((res, idx) => (
                <li key={idx}>{res}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* CTA Bawah Studi Kasus */}
        <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Tertarik membangun proyek serupa?</h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Mari diskusikan kebutuhan website atau desain visual organisasi/bisnis Anda.
            </p>
          </div>
          <Link
            href="/#contact"
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-sm rounded-lg transition-colors shrink-0"
          >
            Diskusikan Proyek
          </Link>
        </div>
      </div>
    </main>
  );
}
