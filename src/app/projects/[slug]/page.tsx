"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function ProjectDetailPage() {
  const params = useParams();
  const rawSlug = params.slug as string;
  const slug = rawSlug ? decodeURIComponent(rawSlug) : '';

  const [project, setProject] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: projectData } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('slug', slug)
        .limit(1)
        .maybeSingle();

      if (projectData) setProject(projectData);

      const { data: imageData } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_slug', slug)
        .order('sort_order', { ascending: true });

      if (imageData) setImages(imageData);
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
        <div className="container mx-auto px-6 py-24 space-y-8">
          <div className="h-10 w-64 bg-zinc-800/50 rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-zinc-800/50 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-video rounded-2xl bg-zinc-800/50 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-400 text-lg">Proyek tidak ditemukan.</p>
          <Link href="/#projects" className="text-cyan-400 hover:underline">← Kembali ke Beranda</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer" onClick={() => setSelectedImage(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
          />
          <p className="absolute bottom-6 text-zinc-400 text-sm font-mono">Klik di mana saja untuk menutup</p>
        </div>
      )}

      <div className="container mx-auto px-6 py-16 md:py-24 space-y-12">
        {/* Back Button */}
        <div>
          <Link href="/#projects"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors font-mono text-sm group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-6">
          {project.image_url && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 cursor-pointer" onClick={() => setSelectedImage(project.image_url)}>
              <Image src={project.image_url} alt={project.alt_text || project.title} fill sizes="100vw" className="object-contain hover:scale-[1.01] transition-transform duration-500" />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold text-white">{project.title}</h1>
              <p className="text-zinc-400 text-base md:text-lg max-w-2xl leading-relaxed">{project.description}</p>
            </div>
            {project.link && (
              <a href={project.link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors text-sm shrink-0">
                <ExternalLink size={16} /> Buka Proyek
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tech_array?.map((tech: string) => (
              <span key={tech} className="px-3 py-1 text-xs font-mono text-cyan-400 bg-cyan-950/30 rounded-full border border-cyan-900/50">
                {tech}
              </span>
            ))}
          </div>

          <div className="w-12 h-0.5 bg-cyan-500" />
        </div>

        {/* Gallery */}
        {images.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Tangkapan Layar &amp; Desain</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 cursor-pointer hover:border-cyan-500/50 transition-colors"
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <div className="relative w-full aspect-video">
                    <Image src={img.image_url} alt={img.alt_text || img.caption || `Screenshot ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-contain group-hover:scale-[1.02] transition-transform duration-500" />
                  </div>
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-sm text-zinc-300 font-mono">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length === 0 && (
          <div className="text-center py-12 text-zinc-500 font-mono">
            Belum ada tangkapan layar tambahan untuk proyek ini.
          </div>
        )}
      </div>
    </main>
  );
}
