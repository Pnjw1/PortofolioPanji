import type { Metadata } from "next";
import Script from "next/script";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ScrollToTop from "@/components/ScrollToTop";
import PageViewTracker from "@/components/PageViewTracker";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";
import { SITE } from "@/lib/site";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-P3M2ZQD2";
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-4P39HEVZB5";
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-8101810994202815";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Panji Wiguna — Web Developer & Desainer Komunikasi Visual (DKV)",
  description:
    "Membangun aplikasi web modern yang cepat sekaligus merancang identitas visual dan konten digital yang rapi, menggabungkan logika pemrograman (TJKT) dengan kepekaan desain (DKV).",
  authors: [{ name: "Panji Wiguna" }],
  verification: {
    google: "aInrjvQjT0_0CSueDlePUm77XhHwx3qiwyMGs6cK9gM",
  },
  other: {
    "google-adsense-account": ADSENSE_CLIENT,
  },
  alternates: {
    canonical: SITE.url,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Panji Wiguna — Web Developer & Desainer Komunikasi Visual (DKV)",
    description:
      "Membangun aplikasi web modern yang cepat sekaligus merancang identitas visual dan konten digital yang rapi, menggabungkan logika pemrograman (TJKT) dengan kepekaan desain (DKV).",
    url: SITE.url,
    siteName: "Panji Wiguna Portfolio",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Panji Wiguna — Web Developer & Desainer Komunikasi Visual (DKV)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Panji Wiguna — Web Developer & Desainer Komunikasi Visual (DKV)",
    description:
      "Membangun aplikasi web modern yang cepat sekaligus merancang identitas visual dan konten digital yang rapi, menggabungkan logika pemrograman (TJKT) dengan kepekaan desain (DKV).",
    images: ["/images/og-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${geistSans.variable} ${jetbrainsMono.variable} antialiased bg-[#0a0a0a] text-zinc-100 selection:bg-cyan-500/30 font-sans`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Panji Wiguna",
              url: SITE.url,
              image: `${SITE.url}/images/panji-wiguna.png`,
              sameAs: [
                SITE.github,
                SITE.linkedin,
                SITE.instagram
              ],
              jobTitle: "Web Developer & Desainer Komunikasi Visual (DKV)",
              worksFor: {
                "@type": "Organization",
                name: "Freelance"
              },
              address: {
                "@type": "PostalAddress",
                "streetAddress": "Jatinangor",
                "addressLocality": "Sumedang",
                "addressRegion": "Jawa Barat",
                "addressCountry": "ID"
              }
            })
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-zinc-950 focus:rounded-lg focus:font-semibold"
        >
          Lewati ke konten utama
        </a>
        <ToastProvider>
          {children}
        </ToastProvider>
        <ScrollToTop />
        <PageViewTracker />
        <Analytics />
        <Script
          src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-tag-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
