"use client";

import { motion } from 'framer-motion';
import { Terminal, MapPin, Briefcase, GraduationCap, Heart } from 'lucide-react';

const terminalLines = [
  { prompt: true, command: "cat bio.txt", delay: 0.2 },
  { prompt: false, text: "Fullstack Developer (Vibe Coding) & Visual Communication Designer (DKV) berbasis di Jatinangor.", delay: 0.5 },
  { prompt: false, text: "Mengembangkan aplikasi web modern dengan pendekatan Vibe Coding (AI-assisted development),", delay: 0.7 },
  { prompt: false, text: "didukung pemahaman desain antarmuka DKV serta dasar jaringan komputer TJKT.", delay: 0.9 },
  { prompt: true, command: "cat stack.json", delay: 1.3 },
  { prompt: false, text: '{"method": "Vibe Coding (AI-Assisted)", "design": "DKV UI/UX", "infra": "TJKT Networking"}', delay: 1.5 },
];

const highlights = [
  {
    icon: <MapPin size={18} className="text-cyan-400" />,
    label: "Location",
    value: "Jatinangor, Jawa Barat, Indonesia",
  },
  {
    icon: <GraduationCap size={18} className="text-purple-400" />,
    label: "Education",
    value: "Lulusan SMK 2026 — Jurusan TJKT",
  },
  {
    icon: <Briefcase size={18} className="text-emerald-400" />,
    label: "Focus",
    value: "Fullstack Web & Visual Design (DKV)",
  },
  {
    icon: <Heart size={18} className="text-rose-400" />,
    label: "Methodology",
    value: "Vibe Coding & Prompt Engineering",
  },
];

export default function About() {
  return (
    <section className="space-y-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <Terminal className="text-cyan-400" size={32} />
          <span>About Me</span>
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Terminal Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-zinc-700 shadow-2xl">
            {/* Terminal Header */}
            <div className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-2 border-b border-zinc-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-400 transition-colors" />
              </div>
              <div className="mx-auto text-xs text-zinc-400 font-mono">
                <span>panji@root: ~</span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm space-y-3 text-zinc-300">
              {terminalLines.map((line, i) =>
                line.prompt ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: line.delay }}
                    className="flex gap-3 items-center"
                  >
                    <span className="text-green-400 shrink-0">panji@root:~$</span>
                    <span className="text-cyan-300">{line.command}</span>
                  </motion.div>
                ) : (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: line.delay }}
                    className="pl-4 border-l-2 border-zinc-700 text-zinc-400 leading-relaxed"
                  >
                    {line.text}
                  </motion.p>
                )
              )}

              {/* Blinking cursor */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.6 }}
                className="flex gap-3 items-center pt-2"
              >
                <span className="text-green-400 shrink-0">panji@root:~$</span>
                <span className="w-2.5 h-5 bg-zinc-400 animate-pulse inline-block" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {highlights.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
                  {item.icon}
                </div>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{item.label}</span>
              </div>
              <p className="text-sm text-zinc-300 font-medium leading-snug">{item.value}</p>
            </motion.div>
          ))}

          {/* Fun Numbers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="sm:col-span-2 p-5 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-cyan-500/20 rounded-xl"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { num: "3+", label: "Years Coding" },
                { num: "5+", label: "Projects Built" },
                { num: "10+", label: "Certificates" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                    {stat.num}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
