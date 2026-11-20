"use client";

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, PanInfo } from 'framer-motion';
import { Github, Linkedin, Instagram, Mail, Code2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import VisitorCounter from './VisitorCounter';
import Image from 'next/image';
import { useRef, useCallback, useEffect, useState } from 'react';
import { SITE } from '@/lib/site';

/* =========================================
   KARTU NAMA GANTUNG
   - Tali mengikuti ayunan kartu
   - Seret atau arahkan kursor untuk mengayunkan
   - Klik untuk membalik, sisi belakang berisi QR ke portofolio
   ========================================= */

function PendulumNameTag() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Sudut ayunan dalam derajat (positif = kanan, negatif = kiri)
  const swingAngle = useMotionValue(0);
  const smoothAngle = useSpring(swingAngle, {
    stiffness: 40,
    damping: 8,
    mass: 1.2,
  });

  // Goyangan pelan saat diam. Ditunda sedikit agar tidak membebani initial load (TBT),
  // dan otomatis berhenti saat tab tidak aktif.
  const idleAngle = useMotionValue(0);
  useEffect(() => {
    if (reduceMotion) {
      idleAngle.set(0);
      return;
    }
    let frame = 0;
    let t = 0;
    const animate = () => {
      if (!document.hidden) {
        t += 0.015;
        idleAngle.set(Math.sin(t) * 2);
      }
      frame = requestAnimationFrame(animate);
    };
    const startTimer = window.setTimeout(() => {
      frame = requestAnimationFrame(animate);
    }, 2000);
    return () => {
      window.clearTimeout(startTimer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [idleAngle, reduceMotion]);

  const rotate = useTransform([smoothAngle, idleAngle], ([a, i]) => (a as number) + (i as number));
  const ropeControlX = useTransform(smoothAngle, [-30, 0, 30], [20, 0, -20]);
  const ropePath = useTransform(ropeControlX, (cx) => `M 0 0 Q ${cx * 1.2} 44 0 80`);

  const handleDrag = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (reduceMotion) return;
    const angle = Math.max(-35, Math.min(35, info.offset.x * -0.25));
    swingAngle.set(angle);
  }, [swingAngle, reduceMotion]);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (reduceMotion) return;
    const momentum = Math.max(-45, Math.min(45, info.velocity.x * 0.05));
    swingAngle.set(momentum);
    setTimeout(() => swingAngle.set(0), 100);
  }, [swingAngle, reduceMotion]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || reduceMotion) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    swingAngle.set(Math.max(-15, Math.min(15, offsetX * -0.06)));
  }, [swingAngle, reduceMotion]);

  const handleMouseLeave = useCallback(() => {
    swingAngle.set(0);
  }, [swingAngle]);

  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tali */}
      <svg
        width="60"
        height="80"
        viewBox="-30 0 60 80"
        className="z-10 overflow-visible pointer-events-none"
        aria-hidden="true"
      >
        <motion.path
          fill="none"
          stroke="#52525b"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ d: ropePath }}
        />
      </svg>

      {/* Kartu berayun dari titik tengah atas */}
      <motion.div
        drag={reduceMotion ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ rotate: reduceMotion ? 0 : rotate, transformOrigin: 'top center', x: 0 }}
        className="relative cursor-grab active:cursor-grabbing touch-none -mt-1"
      >
        {/* Klip logam */}
        <div className="relative flex justify-center z-20" aria-hidden="true">
          <div className="w-6 h-10 bg-zinc-400 rounded-t-md relative -mb-4">
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-5 border-[3px] border-zinc-600 rounded-full opacity-60" />
          </div>
        </div>

        <div className="relative w-[220px] h-[340px] md:w-[260px] md:h-[400px] z-10 [perspective:1000px]">
          <motion.div
            className="w-full h-full relative"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 50, damping: 10 }}
          >
            {/* DEPAN */}
            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              aria-label="Balik kartu untuk melihat QR portofolio"
              aria-hidden={isFlipped}
              tabIndex={isFlipped ? -1 : 0}
              className="absolute inset-0 rounded-2xl overflow-hidden bg-[#161616] border border-zinc-700 flex flex-col text-left cursor-pointer"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="w-14 h-3 mx-auto mt-3 rounded-full bg-[#0a0a0a] border-b border-white/5" />

              <div className="relative w-32 h-36 md:w-40 md:h-44 mx-auto mt-6 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 shrink-0">
                <Image
                  src="/images/panji-wiguna.webp"
                  alt="Foto Panji Wiguna"
                  fill
                  sizes="(max-width: 768px) 128px, 160px"
                  className="object-cover object-top"
                  priority
                />
              </div>

              <div className="flex-1 flex flex-col justify-center items-center px-4 space-y-1.5 text-center">
                <p className="text-white font-bold text-xl md:text-2xl tracking-tight">Panji Wiguna</p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Web Developer &amp; Desainer<br />
                  Komunikasi Visual (DKV)
                </p>
              </div>

              <div className="px-5 py-3 border-t border-white/5 text-center">
                <p className="text-zinc-400 text-[10px] font-mono">Jatinangor, Indonesia</p>
              </div>
            </button>

            {/* BELAKANG */}
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              aria-label="Balik kartu ke sisi depan"
              aria-hidden={!isFlipped}
              tabIndex={isFlipped ? 0 : -1}
              className="absolute inset-0 rounded-2xl overflow-hidden bg-[#161616] border border-zinc-700 flex flex-col items-center cursor-pointer"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="w-14 h-3 mt-3 rounded-full bg-[#0a0a0a] border-b border-white/5" />

              <div className="flex-1 flex flex-col justify-center items-center w-full px-6 space-y-5">
                <div className="bg-white rounded-lg p-3">
                  <QRCodeSVG
                    value={SITE.url}
                    size={128}
                    level="M"
                    title="QR code menuju portofolio Panji Wiguna"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-zinc-300 text-xs">Pindai untuk membuka portofolio</p>
                  <p className="text-cyan-400 text-xs font-mono">panjiwiguna.site</p>
                </div>
              </div>
            </button>
          </motion.div>
        </div>
      </motion.div>

      <p className="text-zinc-400 text-[10px] md:text-xs font-mono mt-4 text-center">
        <span className="hidden md:inline">Geser atau arahkan kursor untuk mengayunkan, klik untuk membalik</span>
        <span className="md:hidden">Geser untuk mengayunkan, ketuk untuk membalik</span>
      </p>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-6 min-h-[80vh]">
      {/* Teks */}
      <div className="flex-1 space-y-6">
        <div className="space-y-4">
          <p className="text-zinc-400 font-mono text-sm">Jatinangor, Indonesia</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Panji Wiguna
          </h1>
          <p className="text-xl md:text-2xl text-cyan-400 font-semibold leading-snug max-w-xl">
            Web Developer &amp; Desainer Komunikasi Visual (DKV)
          </p>
        </div>

        <p className="text-zinc-300 text-base md:text-lg leading-relaxed max-w-xl">
          Membangun aplikasi web modern yang cepat sekaligus merancang identitas visual dan konten digital yang rapi,
          menggabungkan logika pemrograman (TJKT) dengan kepekaan desain (DKV).
        </p>

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <a
            href="#projects"
            className="px-6 py-3 bg-cyan-500 text-zinc-950 rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
          >
            Lihat Karya
          </a>
          <a
            href="/CV_Panji_Wiguna.pdf"
            download="CV_Panji_Wiguna.pdf"
            className="px-5 py-3 bg-zinc-900 text-zinc-200 border border-zinc-700 rounded-lg font-medium hover:border-cyan-500 hover:text-cyan-400 transition-colors"
          >
            Unduh CV (PDF)
          </a>

          <div className="flex gap-3">
            <SocialLink href="https://g.dev/panjiwiguna" icon={<Code2 size={20} />} label="Google Developer Profile" />
            <SocialLink href={SITE.github} icon={<Github size={20} />} label="GitHub" />
            <SocialLink href={SITE.linkedin} icon={<Linkedin size={20} />} label="LinkedIn" />
            <SocialLink href={SITE.instagram} icon={<Instagram size={20} />} label="Instagram" />
            <SocialLink href={`mailto:${SITE.email}`} icon={<Mail size={20} />} label="Email" />
          </div>

          <VisitorCounter />
        </div>
      </div>

      {/* Kartu nama gantung */}
      <div className="relative flex-1 flex justify-center">
        <PendulumNameTag />
      </div>
    </section>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="p-2.5 text-zinc-400 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:text-cyan-400 hover:border-zinc-600 transition-colors"
    >
      {icon}
    </a>
  );
}
