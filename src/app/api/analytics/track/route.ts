import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const BOT_REGEX = /bot|crawler|spider|crawling|headless|lighthouse|pingdom|uptime|preview|slurp|facebookexternalhit/i;

function detectDevice(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function normalizeReferrer(rawReferrer: unknown): string {
  if (typeof rawReferrer !== 'string' || !rawReferrer.trim()) {
    return 'Direct';
  }
  try {
    const parsed = new URL(rawReferrer.trim());
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (!host || host === 'panjiwiguna.site' || host === 'localhost') {
      return 'Direct';
    }
    return host.slice(0, 120);
  } catch {
    return 'Direct';
  }
}

function sanitizePath(rawPath: unknown): string | null {
  if (typeof rawPath !== 'string') return null;
  const trimmed = rawPath.trim();
  if (!trimmed.startsWith('/')) return null;
  // Jangan lacak halaman admin, API, atau aset internal
  if (
    trimmed.startsWith('/admin') ||
    trimmed.startsWith('/api') ||
    trimmed.startsWith('/_next')
  ) {
    return null;
  }
  const clean = trimmed.split('?')[0].split('#')[0];
  return clean.slice(0, 200) || '/';
}

export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    if (BOT_REGEX.test(userAgent)) {
      return NextResponse.json({ ok: true, skipped: 'bot' });
    }

    const body = await request.json().catch(() => null);
    const path = sanitizePath(body?.path);
    if (!path) {
      return NextResponse.json({ ok: true, skipped: 'invalid_path' });
    }

    const referrer = normalizeReferrer(body?.referrer);
    const device_type = detectDevice(userAgent);

    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const dayKey = new Date().toISOString().slice(0, 10);
    const visitor_hash = createHash('sha256')
      .update(`${ip}|${userAgent}|${dayKey}`)
      .digest('hex')
      .slice(0, 32);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('portfolio_pageviews').insert([
      {
        path,
        referrer,
        device_type,
        visitor_hash,
      },
    ]);

    if (error) {
      // Jangan kirim 500 ke pengunjung jika tabel analytics belum dijalankan di Supabase
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
