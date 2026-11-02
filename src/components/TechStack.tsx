"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Server, Layout, Database, TerminalSquare, Container, Network, SearchCode, Wand2 } from 'lucide-react';
import Marquee from 'react-fast-marquee';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Tech {
  name: string;
  icon_name: string;
  category: string;
  color_class: string;
  logo_url?: string | null;
}

// Map database icon strings to Lucide components
const iconMap: Record<string, React.ReactNode> = {
  Layout: <Layout />,
  SearchCode: <SearchCode />,
  Database: <Database />,
  TerminalSquare: <TerminalSquare />,
  Network: <Network />,
  Server: <Server />,
  Container: <Container />,
  Wand2: <Wand2 />
};

export default function TechStack() {
  const [technologies, setTechnologies] = useState<Tech[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTech() {
      try {
        const { data, error } = await supabase.from('portfolio_tech').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
          setTechnologies(data);
        }
      } catch (err) {
        console.error('Error fetching tech stack:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTech();
  }, []);

  return (
    <section className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <Cpu className="text-cyan-400" size={32} />
          <span>Tech Arsenal</span>
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
      </motion.div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex gap-6 overflow-hidden py-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48 md:w-56 h-40 rounded-xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      )}

      {/* Marquee Container */}
      {!loading && technologies.length > 0 && (
        <div className="relative mt-8 py-4 -mx-6 md:-mx-12 px-6 md:px-12">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        
          <Marquee speed={50} pauseOnHover={true} gradient={false} className="py-2">
            <div className="flex gap-6 px-3">
              {technologies.map((tech) => (
                <div
                  key={tech.name}
                  className="group relative w-48 md:w-56 p-6 rounded-xl bg-[#1e1e1e] border border-zinc-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] flex flex-col items-center justify-center gap-4 text-center overflow-hidden flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 p-2 w-16 h-16 rounded-xl bg-zinc-900 shadow-inner group-hover:scale-110 flex items-center justify-center transition-transform duration-300 overflow-hidden">
                    {tech.logo_url ? (
                      <div className="relative w-full h-full">
                        <Image 
                          src={tech.logo_url} 
                          alt={tech.name} 
                          fill 
                          sizes="48px" 
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${tech.color_class}`}>
                        {iconMap[tech.icon_name] || <Layout />}
                      </div>
                    )}
                  </div>
                  <div className="relative z-10 w-full">
                    <h3 className="font-semibold text-zinc-200 text-lg group-hover:text-cyan-300 transition-colors truncate">{tech.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono mt-1">{tech.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </Marquee>
        </div>
      )}
    </section>
  );
}
