import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uwcaukrtnovjdfnofksi.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking attacks
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control referrer information
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Enable DNS prefetching
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // Force HTTPS (only effective when served over HTTPS/Vercel)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // CSP Report-Only: pelanggaran hanya dicatat di konsol browser, tidak diblokir.
          // Setelah konsol bersih di semua halaman, ganti key menjadi 'Content-Security-Policy'.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com https://giscus.app",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://uwcaukrtnovjdfnofksi.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://uwcaukrtnovjdfnofksi.supabase.co https://challenges.cloudflare.com https://vitals.vercel-insights.com https://giscus.app",
              "frame-src https://challenges.cloudflare.com https://open.spotify.com https://www.youtube.com https://giscus.app",
              "media-src 'self' https: data: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
