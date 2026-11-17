"use client";

import { useRef, useState, useEffect } from 'react';
import { Mail, Phone, Code2, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { SITE } from '@/lib/site';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) {
      toast(`Harap tunggu ${cooldown} detik sebelum mengirim pesan lagi.`, 'error');
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      toast('Semua kolom harus diisi!', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast('Format email tidak valid!', 'error');
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
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
        if (response.status === 429) {
          setCooldown(60);
        }
      } else {
        toast('Pesan berhasil terkirim!', 'success');
        setFormData({ name: '', email: '', message: '' });
        setCooldown(60);
      }
    } catch {
      setLoading(false);
      toast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    }
  };

  return (
    <section className="py-12 space-y-10">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Kontak</h2>
        <div className="w-12 h-0.5 bg-cyan-500" />
        <p className="text-zinc-400 max-w-xl text-base">
          Punya tawaran pekerjaan, proyek kolaborasi, atau pertanyaan? Silakan hubungi saya langsung melalui email, WhatsApp, atau formulir berikut.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Direct Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-200">Kontak Langsung</h3>
          <a 
            href={`mailto:${SITE.email}`}
            className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-100 font-medium rounded-xl flex items-center gap-3 transition-colors"
          >
            <Mail size={18} className="text-cyan-400 shrink-0" />
            <span className="truncate">{SITE.email}</span>
          </a>
          
          <a 
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-100 font-medium rounded-xl flex items-center gap-3 transition-colors"
          >
            <Phone size={18} className="text-cyan-400 shrink-0" />
            <span>WhatsApp (+62 888-0940-9219)</span>
          </a>

          <a 
            href="https://g.dev/panjiwiguna" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-100 font-medium rounded-xl flex items-center gap-3 transition-colors"
          >
            <Code2 size={18} className="text-cyan-400 shrink-0" />
            <span>Google Developer Profile</span>
          </a>
        </div>

        {/* Form */}
        <div className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4">Kirim Pesan</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-mono text-zinc-400 mb-1">Nama</label>
              <input 
                id="contact-name"
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nama Anda"
                maxLength={100}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs font-mono text-zinc-400 mb-1">Email</label>
              <input 
                id="contact-email"
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@domain.com"
                maxLength={100}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-xs font-mono text-zinc-400 mb-1">Pesan</label>
              <textarea 
                id="contact-message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Tulis pesan Anda..."
                rows={4}
                maxLength={1000}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-cyan-500 transition-colors resize-none"
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
            
            {turnstileSiteKey && (
              <div className="flex justify-center py-2">
                <Turnstile 
                  ref={turnstileRef}
                  siteKey={turnstileSiteKey} 
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  options={{ theme: 'dark' }}
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || cooldown > 0 || (Boolean(turnstileSiteKey) && !turnstileToken)}
              className="w-full py-3 bg-cyan-500 text-zinc-950 font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Mengirim...
                </>
              ) : cooldown > 0 ? (
                `Tunggu ${cooldown} detik...`
              ) : (
                <>
                  <Send size={18} />
                  Kirim Pesan
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
