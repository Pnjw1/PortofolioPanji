"use client";

import { useState } from 'react';
import { ArrowRight, ExternalLink, FolderGit2, Router, Terminal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { buildCaseStudy, getProjectSlug, type ProjectRecord } from '@/lib/project-case-studies';

export type Project = ProjectRecord;

const iconMap: Record<string, React.ReactNode> = {
  FolderGit2: <FolderGit2 className="text-cyan-400" size={28} />,
  Router: <Router className="text-cyan-400" size={28} />,
  Terminal: <Terminal className="text-cyan-400" size={28} />,
};

export default function Projects({ initialProjects = [] }: { initialProjects?: Project[] }) {
  const [showAll, setShowAll] = useState(false);
  const projects = initialProjects;
  const visibleProjects = showAll ? projects : projects.slice(0, 3);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Proyek Pilihan</h2>
          <div className="w-12 h-0.5 bg-cyan-500" />
          <p className="text-zinc-400 text-sm md:text-base max-w-xl">
            Studi kasus proyek web, sistem informasi, dan otomasi yang saya bangun dari tahap perancangan hingga implementasi.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center">
          <p className="text-sm text-zinc-400">Belum ada proyek yang ditampilkan.</p>
        </div>
      ) : (
        <>
          {/* Grid 3 Kartu */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProjects.map((project, index) => {
              const slug = getProjectSlug(project);
              const caseStudy = buildCaseStudy(project);
              const topTechs = (project.tech_array || []).slice(0, 3);

              return (
                <article
                  key={project.id || index}
                  className="group rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Thumbnail 16:9 */}
                    <Link
                      href={`/projects/${encodeURIComponent(slug)}`}
                      className="block relative w-full aspect-video bg-zinc-950 border-b border-zinc-800 overflow-hidden"
                    >
                      {project.image_url ? (
                        <Image
                          src={project.image_url}
                          alt={project.alt_text || `Tangkapan layar proyek ${project.title}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                            {(project.icon_name && iconMap[project.icon_name]) || (
                              <Terminal className="text-cyan-400" size={28} />
                            )}
                          </div>
                        </div>
                      )}
                    </Link>

                    {/* Judul, 1 kalimat hasil, & maks 3 tag stack */}
                    <div className="p-5 space-y-3">
                      <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        <Link href={`/projects/${encodeURIComponent(slug)}`}>
                          {project.title}
                        </Link>
                      </h3>

                      <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                        {caseStudy.oneLineResult}
                      </p>

                      {topTechs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {topTechs.map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 text-xs font-mono text-cyan-400 bg-cyan-950/30 rounded-md border border-cyan-900/50"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer kartu: Tombol Lihat Studi Kasus + tautan situs live jika ada */}
                  <div className="px-5 py-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                    <Link
                      href={`/projects/${encodeURIComponent(slug)}`}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Lihat Studi Kasus</span>
                      <ArrowRight
                        size={15}
                        className="group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      />
                    </Link>

                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Buka situs ${project.title}`}
                        title="Buka situs live"
                        className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                      >
                        <span>Live</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Tombol Lihat Semua jika proyek lebih dari 3 */}
          {projects.length > 3 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="px-5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/40 text-sm font-medium text-zinc-200 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {showAll ? 'Tampilkan 3 Proyek Utama' : `Lihat Semua Proyek (${projects.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
