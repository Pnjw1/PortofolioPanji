"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { SITE } from "@/lib/site";

const navLinks = [
  { label: "Proyek", href: "#projects" },
  { label: "Layanan", href: "#services" },
  { label: "Pengalaman", href: "#experience" },
  { label: "Tentang", href: "#about" },
  { label: "Keahlian", href: "#tech" },
  { label: "Sertifikat", href: "#certificates" },
  { label: "Blog", href: "/blog" },
  { label: "Unduh CV", href: "/CV_Panji_Wiguna.pdf", download: true },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    // For non-anchor links (like /blog), let the browser navigate normally
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 bg-zinc-800/80 border border-zinc-700/50 rounded-lg flex items-center justify-center overflow-hidden group-hover:border-cyan-500/40 transition-all duration-300">
                <Image src="/images/favicon.svg" alt="Logo Panji Wiguna" width={28} height={28} />
              </div>
              <span className="font-mono text-sm font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                panjiwiguna
              </span>
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  download={link.download ? "CV_Panji_Wiguna.pdf" : undefined}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-cyan-400 group-hover:w-4 transition-all duration-300 rounded-full" />
                </a>
              ))}
              <a
                href="#contact"
                onClick={(e) => handleLinkClick(e, "#contact")}
                className="ml-4 px-5 py-2 bg-cyan-500 text-zinc-950 rounded-lg text-sm font-semibold hover:bg-cyan-400 transition-colors cursor-pointer"
              >
                Hubungi Saya
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-zinc-800 shadow-xl md:hidden"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  download={link.download ? "CV_Panji_Wiguna.pdf" : undefined}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 font-medium"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={(e) => handleLinkClick(e, "#contact")}
                className="mt-2 px-4 py-3 text-sm text-center bg-cyan-500 text-zinc-950 rounded-lg font-semibold hover:bg-cyan-400 transition-colors cursor-pointer"
              >
                Hubungi Saya
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
