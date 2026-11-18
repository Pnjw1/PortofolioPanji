"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Instagram, Mail } from 'lucide-react';
import { SITE } from '@/lib/site';

const socialLinks = [
  { href: SITE.github, icon: Github, label: 'GitHub' },
  { href: SITE.linkedin, icon: Linkedin, label: 'LinkedIn' },
  { href: SITE.instagram, icon: Instagram, label: 'Instagram' },
  { href: `mailto:${SITE.email}`, icon: Mail, label: 'Email' },
];

const navLinks = [
  { label: 'Proyek', href: '#projects', download: false },
  { label: 'Layanan', href: '#services', download: false },
  { label: 'Pengalaman', href: '#experience', download: false },
  { label: 'Tentang', href: '#about', download: false },
  { label: 'Keahlian', href: '#tech', download: false },
  { label: 'Blog', href: '/blog', download: false },
  { label: 'Unduh CV', href: '/CV_Panji_Wiguna.pdf', download: true },
  { label: 'Kontak', href: '#contact', download: false },
];

export default function Footer() {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer className="relative z-10 border-t border-zinc-800/50 bg-[#0a0a0a]">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-zinc-800/80 border border-zinc-700/50 rounded-lg flex items-center justify-center overflow-hidden">
                <Image src="/images/favicon.svg" alt="Logo Panji Wiguna" width={28} height={28} />
              </div>
              <span className="font-mono text-sm font-bold text-white">panjiwiguna</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              Web Developer &amp; Desainer Komunikasi Visual (DKV) berbasis di Jatinangor, Indonesia.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Navigasi</h4>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  download={link.download ? "CV_Panji_Wiguna.pdf" : undefined}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors w-fit"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Connect</h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 font-mono">
            &copy; {new Date().getFullYear()} Panji Wiguna. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 font-mono">
            Built with <span className="text-cyan-400">Next.js</span> &amp; <span className="text-zinc-200">Supabase</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
