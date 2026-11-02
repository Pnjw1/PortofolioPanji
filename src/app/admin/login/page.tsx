"use client";

import { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { login } from '@/app/actions/auth';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await login(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT') || err.message === 'NEXT_REDIRECT') {
        // Redirect berhasil, biarkan Next.js handle
        return;
      }
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700 shadow-inner">
              <Lock className="text-cyan-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold font-mono text-zinc-100">Admin Area</h1>
            <p className="text-zinc-400 text-sm">Masuk dengan akun Supabase Anda</p>
          </div>

          <form action={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-500">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-500">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono text-sm"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl transition-colors duration-300 shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
