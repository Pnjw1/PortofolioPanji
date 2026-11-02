"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowUpRight, FolderGit2, Router, Terminal, AlertCircle } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Project {
  id: number;
  title: string;
  description: string;
  type: 'detail' | 'external';
  slug?: string;
  link?: string;
  image_url?: string;
  alt_text?: string;
  icon_name?: string;
  tech_array?: string[];
  gradient_class: string;
  hover_border_class: string;
}

const iconMap: Record<string, React.ReactNode> = {
  FolderGit2: <FolderGit2 className="text-purple-400" size={24} />,
  Router: <Router className="text-cyan-400" size={24} />,
  Terminal: <Terminal className="text-green-400" size={24} />,
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase.from('portfolio_projects').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Gagal memuat projects. Silakan refresh halaman.');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <section id="projects" className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <Briefcase className="text-cyan-400" size={32} />
          <span>Featured Projects</span>
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
      </motion.div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex gap-4 overflow-hidden">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-80 md:w-96 h-72 rounded-2xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-mono">{error}</p>
        </div>
      )}

      {/* Projects Swiper */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="w-full relative"
        >
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView={1.05}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              640: { slidesPerView: 1.2, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 2.2, spaceBetween: 24 },
            }}
            className="w-full !pb-14 !px-2 md:!px-0 projects-swiper"
          >
            {projects.map((project, index) => {
              const isDetail = project.type === 'detail' && project.slug;

              const cardContent = (
                <>
                  {/* Background Gradient */}
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${project.gradient_class} opacity-50 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10 space-y-4 mb-4 flex-1">
                    {project.image_url ? (
                      <div className="relative w-full aspect-video mb-4 rounded-xl overflow-hidden border border-zinc-700/50 bg-zinc-900/50">
                        <Image 
                          src={project.image_url} 
                          alt={project.alt_text || project.title} 
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-zinc-900 rounded-lg inline-block border border-zinc-800 mb-4">
                        {(project.icon_name && iconMap[project.icon_name]) || <Terminal className="text-zinc-400" size={24} />}
                      </div>
                    )}
                    
                    <h3 className="text-xl md:text-2xl font-bold text-zinc-100 group-hover:text-white transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="relative z-10 flex items-end justify-between mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {project.tech_array && project.tech_array.map((tech: string) => (
                        <span key={tech} className="px-3 py-1 text-xs font-mono text-cyan-400 bg-cyan-950/30 rounded-full border border-cyan-900/50">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="p-2 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-cyan-500 group-hover:text-zinc-900 transition-colors duration-300">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                </>
              );

              const cardClass = `group h-full relative p-5 md:p-6 rounded-2xl bg-[#1e1e1e] border border-zinc-800 ${project.hover_border_class} transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer block hover:-translate-y-1`;

              return (
                <SwiperSlide key={project.id || index} className="h-full">
                  {isDetail ? (
                    <Link href={`/projects/${project.slug}`} className={cardClass}>
                      {cardContent}
                    </Link>
                  ) : (
                    <a
                      href={project.link || "#"}
                      target={project.link ? "_blank" : undefined}
                      rel={project.link ? "noopener noreferrer" : undefined}
                      className={cardClass}
                    >
                      {cardContent}
                    </a>
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </motion.div>
      )}
    </section>
  );
}
