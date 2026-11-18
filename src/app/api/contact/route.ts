import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { SITE } from '@/lib/site';
import nodemailer from 'nodemailer';

const MAX_TOTAL_PER_MINUTE = 5;

// Rate limit persistent di Supabase (tanpa mengandalkan memori server lokal yang ter-reset antar instance Vercel).
// Batas: 1 pesan per 60 detik per IP / email, atau maksimal 5 pesan total per 60 detik.
async function isSupabaseRateLimited(email: string, ip: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();

    // Coba panggil RPC dengan parameter IP & email (versi baru)
    const { data: v2Data, error: v2Error } = await supabase.rpc('check_contact_rate_limit', {
      p_email: email,
      p_ip: ip,
    });

    if (!v2Error && typeof v2Data === 'boolean') {
      return v2Data;
    }

    // Fallback ke RPC recent_message_counts yang sudah ada di Supabase
    const { data, error } = await supabase.rpc('recent_message_counts', { p_email: email });
    if (error || !data || !data[0]) {
      return false;
    }
    const { email_count, total_count } = data[0];
    // 1 pesan per 60 detik per email, atau jika ada pengiriman baru dalam 60 detik dari IP/instans
    return email_count >= 1 || total_count >= MAX_TOTAL_PER_MINUTE;
  } catch {
    return false;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripLineBreaks(str: string): string {
  return str.replace(/[\r\n]+/g, ' ').trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  return realIp ? realIp.trim() : 'unknown-ip';
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Permintaan tidak valid' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Permintaan tidak valid' }, { status: 400 });
    }

    const { name, email, message, token, website } = body as Record<string, unknown>;

    // Honeypot anti-bot
    if (typeof website === 'string' && website.length > 0) {
      return NextResponse.json({ success: true, message: 'Pesan berhasil terkirim' });
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (cleanName.length > 100 || cleanEmail.length > 100 || cleanMessage.length > 1000) {
      return NextResponse.json({ error: 'Data terlalu panjang' }, { status: 400 });
    }

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
    }

    const ip = getClientIp(req);

    // Rate limit persistent berbasis Supabase (1 pesan / 60 detik per IP atau email)
    if (await isSupabaseRateLimited(cleanEmail, ip)) {
      return NextResponse.json(
        { error: 'Harap tunggu 60 detik sebelum mengirim pesan lagi.' },
        { status: 429 }
      );
    }

    // Verifikasi Cloudflare Turnstile di server (jika TURNSTILE_SECRET_KEY diatur)
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (secretKey) {
      if (typeof token !== 'string' || !token) {
        return NextResponse.json({ error: 'Harap selesaikan verifikasi captcha' }, { status: 400 });
      }

      const verifyBody = new URLSearchParams({ secret: secretKey, response: token });
      if (ip !== 'unknown-ip') verifyBody.set('remoteip', ip);

      const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: verifyBody,
      });
      const turnstileResult = await turnstileVerify.json();
      if (!turnstileResult.success) {
        return NextResponse.json({ error: 'Verifikasi captcha gagal' }, { status: 403 });
      }
    }

    // 1. Simpan ke Supabase (menyertakan sender_ip jika kolom tersedia, fallback tanpa sender_ip)
    const supabase = await createSupabaseServerClient();
    let { error: dbError } = await supabase
      .from('portfolio_messages')
      .insert([{ name: cleanName, email: cleanEmail, message: cleanMessage, sender_ip: ip }]);

    if (dbError && dbError.message?.includes('sender_ip')) {
      const retry = await supabase
        .from('portfolio_messages')
        .insert([{ name: cleanName, email: cleanEmail, message: cleanMessage }]);
      dbError = retry.error;
    }

    // Jika RLS policy menolak karena batas 60 detik di level database
    if (dbError && dbError.code === '42501') {
      return NextResponse.json(
        { error: 'Harap tunggu 60 detik sebelum mengirim pesan lagi.' },
        { status: 429 }
      );
    }

    if (dbError) {
      console.error('Supabase insert error:', dbError.code, dbError.message);
    }

    // 2. Kirim notifikasi email
    const receiver = process.env.CONTACT_RECEIVER_EMAIL || SITE.email;
    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && receiver) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const safeName = escapeHtml(cleanName);
        const safeEmail = escapeHtml(cleanEmail);
        const safeMessage = escapeHtml(cleanMessage);

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: receiver,
          replyTo: cleanEmail,
          subject: `[Portofolio] Pesan baru dari ${stripLineBreaks(cleanName).slice(0, 80)}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f4;">
              <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                <h2 style="color: #333;">Pesan baru dari website portofolio</h2>
                <hr style="border: 0; border-top: 1px solid #eee;" />
                <p><strong>Nama:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Pesan:</strong></p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #333; white-space: pre-wrap;">${safeMessage}</div>
                <p style="font-size: 12px; color: #888;">Email otomatis. Balas langsung ke ${safeEmail}.</p>
              </div>
            </div>
          `,
        });
        emailSent = true;
      } catch (mailError) {
        console.error('Gagal mengirim email notifikasi:', mailError);
      }
    }

    if (dbError && !emailSent) {
      return NextResponse.json(
        { error: 'Terjadi kesalahan saat menyimpan pesan. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Pesan berhasil terkirim' });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Silakan coba lagi nanti.' },
      { status: 500 }
    );
  }
}
