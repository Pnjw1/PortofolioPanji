import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import nodemailer from 'nodemailer';

const MAX_PER_EMAIL_PER_MINUTE = 3;
const MAX_TOTAL_PER_MINUTE = 10;

type RateLimitResult = 'ok' | 'limited' | 'error';

// Rate limit memakai RPC SECURITY DEFINER (lihat supabase_contact_ratelimit.sql)
// karena pengunjung anonim tidak punya hak SELECT pada portfolio_messages.
// Batas global ikut diperiksa agar mengganti-ganti email tidak melewati limit.
async function checkRateLimit(email: string): Promise<RateLimitResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('recent_message_counts', { p_email: email });
    if (error || !data || !data[0]) {
      console.error('Rate limit RPC error:', error?.code);
      return 'error';
    }
    const { email_count, total_count } = data[0];
    if (email_count >= MAX_PER_EMAIL_PER_MINUTE || total_count >= MAX_TOTAL_PER_MINUTE) {
      return 'limited';
    }
    return 'ok';
  } catch (err) {
    console.error('Rate limit check failed:', err);
    return 'error';
  }
}

// Escape hanya dipakai saat menyusun HTML email, bukan saat menyimpan ke database.
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

function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : undefined;
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

    // Honeypot: field ini tersembunyi untuk manusia. Bot biasanya mengisinya.
    // Balas sukses agar bot tidak tahu ia terdeteksi.
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

    if (typeof token !== 'string' || !token) {
      return NextResponse.json({ error: 'Captcha token tidak ditemukan' }, { status: 400 });
    }

    // Captcha: fail closed. Tanpa secret key, request ditolak (tidak ada fallback test key).
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY belum diatur. Form kontak dinonaktifkan.');
      return NextResponse.json({ error: 'Layanan sedang tidak tersedia' }, { status: 503 });
    }

    const verifyBody = new URLSearchParams({ secret: secretKey, response: token });
    const ip = getClientIp(req);
    if (ip) verifyBody.set('remoteip', ip);

    const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyBody,
    });
    const turnstileResult = await turnstileVerify.json();
    if (!turnstileResult.success) {
      return NextResponse.json({ error: 'Verifikasi captcha gagal' }, { status: 403 });
    }

    const rate = await checkRateLimit(cleanEmail);
    if (rate === 'limited') {
      return NextResponse.json(
        { error: 'Terlalu banyak pesan. Coba lagi dalam 1 menit.' },
        { status: 429 }
      );
    }
    if (rate === 'error') {
      // Fail closed: lebih baik menolak sementara daripada membuka celah spam.
      return NextResponse.json({ error: 'Layanan sedang tidak tersedia' }, { status: 503 });
    }

    // Simpan data apa adanya. Escape dilakukan saat output (React di admin, escapeHtml di email).
    const supabase = await createSupabaseServerClient();
    const { error: dbError } = await supabase
      .from('portfolio_messages')
      .insert([{ name: cleanName, email: cleanEmail, message: cleanMessage }]);

    if (dbError) {
      console.error('Supabase insert error:', dbError.code, dbError.hint);
      return NextResponse.json(
        { error: 'Terjadi kesalahan. Silakan coba lagi nanti.' },
        { status: 500 }
      );
    }

    // Notifikasi email bersifat tambahan. Pesan sudah tersimpan, jadi kegagalan email tidak menggagalkan request.
    const receiver = process.env.CONTACT_RECEIVER_EMAIL;
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
      } catch (mailError) {
        console.error('Gagal mengirim email notifikasi:', mailError);
      }
    } else {
      console.warn('EMAIL_USER, EMAIL_PASS, atau CONTACT_RECEIVER_EMAIL belum diatur. Email tidak dikirim.');
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
