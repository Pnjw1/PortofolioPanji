"use client";

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Phone, Code2, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { SITE } from '@/lib/site';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast('Semua kolom harus diisi!', 'error');
      return;
    }

    // Validasi format email di client-side
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast('Format email tidak valid!', 'error');
      return;
    }

    if (!turnstileToken) {
      toast('Harap selesaikan verifikasi captcha!', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          token: turnstileToken,
          website: honeypot,
        }),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        toast(result.error || 'Gagal mengirim pesan', 'error');
      } else {
        toast('Pesan berhasil terkirim!', 'success');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch {
      setLoading(false);
      toast('Terjadi kesalahan jaringan', 'error');
    } finally {
      // Token Turnstile hanya berlaku sekali, minta token baru.
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    }
  };
  return (
    <section className="py-20">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-4xl mx-auto p-1px rounded-3xl bg-gradient-to-b from-zinc-800 to-transparent"
      >
        <div className="bg-[#0f0f0f] rounded-[23px] p-8 md:p-16 text-center space-y-8 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-cyan-500/5 blur-[100px] pointer-events-none" />
          
          <div className="w-16 h-16 bg-cyan-950/50 border border-cyan-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="text-cyan-400" size={32} />
          </div>

          <div className="space-y-4 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold">
              Let&apos;s <span className="text-cyan-400">Connect</span>
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-lg">
              Have a project in mind, need network configuration, or just want to chat about tech? My inbox is always open.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10 pt-4 text-left">
            {/* Direct Links */}
            <div className="space-y-6 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-white mb-4">Reaching out directly?</h3>
              <a 
                href={`mailto:${SITE.email}`}
                className="w-full px-6 py-4 bg-zinc-100 text-zinc-900 font-bold rounded-xl flex items-center justify-start gap-4 hover:scale-105 hover:bg-white transition-all duration-300"
              >
                <Mail size={20} />
                {SITE.email}
              </a>
              
              <a 
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-6 py-4 bg-[#1e1e1e] border border-green-500/30 text-green-400 font-bold rounded-xl flex items-center justify-start gap-4 hover:bg-green-500/10 hover:border-green-400 hover:scale-105 transition-all duration-300"
              >
                <Phone size={20} />
                WhatsApp (+62)
              </a>

              <a 
                href="https://g.dev/panjiwiguna" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-6 py-4 bg-[#1e1e1e] border border-purple-500/30 text-purple-400 font-bold rounded-xl flex items-center justify-start gap-4 hover:bg-purple-500/10 hover:border-purple-400 hover:scale-105 transition-all duration-300"
              >
                <Code2 size={20} />
                Google Developer
              </a>
            </div>

            {/* Form */}
            <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-zinc-800">
              <h3 className="text-xl font-bold text-white mb-6">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-mono text-zinc-400 mb-1">Name</label>
                  <input 
                    id="contact-name"
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Your name"
                    maxLength={100}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-mono text-zinc-400 mb-1">Email</label>
                  <input 
                    id="contact-email"
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your.email@example.com"
                    maxLength={100}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-mono text-zinc-400 mb-1">Message</label>
                  <textarea 
                    id="contact-message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="How can I help you?"
                    rows={4}
                    maxLength={1000}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition-colors resize-none"
                  />
                  <p className="text-xs text-zinc-600 text-right font-mono mt-1">{formData.message.length}/1000</p>
                </div>

                {/* Honeypot: tersembunyi untuk pengguna, hanya terisi oleh bot */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>
                
                {/* Cloudflare Turnstile */}
                <div className="flex justify-center py-2">
                  {turnstileSiteKey ? (
                    <Turnstile 
                      ref={turnstileRef}
                      siteKey={turnstileSiteKey} 
                      onSuccess={(token) => setTurnstileToken(token)}
                      onExpire={() => setTurnstileToken(null)}
                      options={{ theme: 'dark' }}
                    />
                  ) : (
                    <p className="text-xs text-zinc-500">Form belum tersedia. Silakan hubungi lewat email.</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !turnstileToken}
                  className="w-full py-3 bg-cyan-500 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
