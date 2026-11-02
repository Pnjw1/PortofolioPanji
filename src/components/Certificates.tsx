"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ChevronRight, FolderOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Certificate {
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

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [childCounts, setChildCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    async function fetchCertificates() {
      try {
        // Fetch only parent-level certs (no parent_slug means it's top-level)
        const { data, error } = await supabase
          .from('portfolio_certificates')
          .select('*')
          .is('parent_slug', null)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
          setCertificates(data);

          // For group-type certs, count how many children they have
          const groupSlugs = data.filter(c => c.type === 'group').map(c => c.slug);
          if (groupSlugs.length > 0) {
            const { data: children, error: childrenError } = await supabase
              .from('portfolio_certificates')
              .select('parent_slug')
              .in('parent_slug', groupSlugs);
            if (childrenError) throw childrenError;
            if (children) {
              const counts: Record<string, number> = {};
              children.forEach(c => {
                counts[c.parent_slug] = (counts[c.parent_slug] || 0) + 1;
              });
              setChildCounts(counts);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCertificates();
  }, []);
  
  const totalPages = Math.ceil(certificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCertificates = certificates.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <Award className="text-cyan-400" size={32} />
          <span>Certifications & Badges</span>
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
      </motion.div>

      <div className="space-y-8 min-h-[400px]">
        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-zinc-800/50 animate-pulse" />
            ))}
          </div>
        )}

        {/* Cert Cards */}
        {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {currentCertificates.map((cert, index) => {
              const isGroup = cert.type === 'group';
              const count = childCounts[cert.slug] || 0;
              
              // Wrapper: Link for groups, anchor for direct links
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
                <motion.div
                  key={cert.id || cert.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CardWrapper
                    className={`group h-full relative p-[1px] rounded-2xl overflow-hidden bg-zinc-800 transition-shadow duration-500 block ${cert.glow_class || ''}`}
                  >
                    {/* Hologram Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-overlay transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
                    
                    <div className={`relative h-full p-6 rounded-2xl bg-zinc-900 border border-zinc-800 ${cert.border_class || ''} transition-colors duration-300 z-20 flex flex-col justify-between overflow-hidden`}>
                      {/* Background Gradient Blob */}
                      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${cert.color_class || 'from-cyan-500/20 to-transparent'} rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700`} />
                      
                      <div className="relative z-30">
                        {isGroup ? (
                          <FolderOpen className="text-zinc-500 group-hover:text-cyan-400 transition-colors duration-300 mb-4" size={28} />
                        ) : (
                          <Award className="text-zinc-500 group-hover:text-cyan-400 transition-colors duration-300 mb-4" size={28} />
                        )}
                        <h3 className="text-xl font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors duration-300">
                          {cert.title}
                        </h3>
                        <p className="text-zinc-400 font-mono text-sm">
                          {cert.issuer}
                        </p>
                        {/* Show child count for groups */}
                        {isGroup && count > 0 && (
                          <p className="text-cyan-400/70 font-mono text-xs mt-2">
                            {count} sertifikat
                          </p>
                        )}
                      </div>
                      
                      <div className="relative z-30 mt-8 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                        <span className="text-xs font-mono text-cyan-400/80 px-2 py-1 bg-cyan-950/30 rounded border border-cyan-900/50 group-hover:bg-cyan-900/50 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                          {isGroup ? (
                            <>LIHAT SEMUA <ChevronRight size={12} /></>
                          ) : (
                            'VIEW PROFILE'
                          )}
                        </span>
                        <span className="text-zinc-500 font-mono text-sm">
                          {cert.year}
                        </span>
                      </div>
                    </div>
                  </CardWrapper>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-mono text-sm border transition-all duration-300 flex items-center justify-center ${
                  currentPage === i + 1 
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-cyan-500/50 hover:text-cyan-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
