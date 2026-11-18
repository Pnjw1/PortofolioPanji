"use client";

import { useState } from 'react';
import { Award, ChevronRight, FolderOpen } from 'lucide-react';
import Link from 'next/link';

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  year: string;
  type: 'group' | 'single';
  slug: string;
  link?: string;
  glow_class?: string;
  border_class?: string;
  color_class?: string;
  parent_slug?: string | null;
}

export default function Certificates({
  initialCertificates = [],
  initialChildCounts = {},
}: {
  initialCertificates?: Certificate[];
  initialChildCounts?: Record<string, number>;
}) {
  const certificates = initialCertificates;
  const childCounts = initialChildCounts;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(certificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCertificates = certificates.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Sertifikasi</h2>
        <div className="w-12 h-0.5 bg-cyan-500" />
      </div>

      {certificates.length === 0 ? (
        <div className="p-8 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center">
          <p className="text-sm text-zinc-400">Belum ada sertifikasi yang ditampilkan.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCertificates.map((cert) => {
              const isGroup = cert.type === 'group';
              const count = childCounts[cert.slug] || 0;

              const CardWrapper = isGroup
                ? ({ children, className }: { children: React.ReactNode; className: string }) => (
                    <Link href={`/certificates/${cert.slug}`} className={className}>
                      {children}
                    </Link>
                  )
                : ({ children, className }: { children: React.ReactNode; className: string }) => (
                    <a href={cert.link} target="_blank" rel="noopener noreferrer" className={className}>
                      {children}
                    </a>
                  );

              return (
                <div key={cert.id || cert.title}>
                  <CardWrapper className="group h-full relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-cyan-500/40 transition-colors p-6 flex flex-col justify-between block">
                    <div>
                      {isGroup ? (
                        <FolderOpen className="text-zinc-500 group-hover:text-cyan-400 transition-colors mb-4" size={28} />
                      ) : (
                        <Award className="text-zinc-500 group-hover:text-cyan-400 transition-colors mb-4" size={28} />
                      )}
                      <h3 className="text-xl font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors">
                        {cert.title}
                      </h3>
                      <p className="text-zinc-400 font-mono text-sm">
                        {cert.issuer}
                      </p>
                      {isGroup && count > 0 && (
                        <p className="text-cyan-400/80 font-mono text-xs mt-2">
                          {count} sertifikat
                        </p>
                      )}
                    </div>

                    <div className="mt-8 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                      <span className="text-xs font-mono text-cyan-400 px-2 py-1 bg-cyan-950/30 rounded border border-cyan-900/50 flex items-center gap-1">
                        {isGroup ? (
                          <>LIHAT SEMUA <ChevronRight size={12} /></>
                        ) : (
                          'LIHAT KREDENSIAL'
                        )}
                      </span>
                      <span className="text-zinc-400 font-mono text-sm">
                        {cert.year}
                      </span>
                    </div>
                  </CardWrapper>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  aria-label={`Halaman sertifikat ${i + 1}`}
                  aria-current={currentPage === i + 1 ? 'page' : undefined}
                  className={`w-10 h-10 rounded-lg font-mono text-sm border transition-colors flex items-center justify-center cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-cyan-500/50 hover:text-cyan-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
