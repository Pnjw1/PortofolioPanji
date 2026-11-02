"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans flex items-center justify-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-red-900/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 text-center space-y-8 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={48} className="text-red-400" />
            </div>
          </div>

          <div className="font-mono">
            <p className="text-red-400 text-sm tracking-widest mb-2">ERROR 404</p>
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-500">
              404
            </h1>
            <p className="text-xl md:text-2xl font-bold text-white mt-4">
              Page Not Found
            </p>
            <p className="text-zinc-500 font-mono text-sm mt-2">
              {">"} The page you requested does not exist in this system.
            </p>
          </div>
        </motion.div>

        {/* Terminal-style error box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-zinc-800 max-w-md mx-auto text-left"
        >
          <div className="bg-[#2d2d2d] px-4 py-2.5 flex items-center gap-2 border-b border-zinc-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="mx-auto text-xs text-zinc-400 font-mono">bash</span>
          </div>
          <div className="p-4 font-mono text-sm space-y-2">
            <p><span className="text-green-400">panji@root:~$</span> <span className="text-cyan-300">navigate --path /</span></p>
            <p className="text-zinc-500 pl-4">{">"} Redirecting to home...</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 rounded-xl font-bold hover:bg-cyan-500/20 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300"
          >
            <Home size={20} />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
