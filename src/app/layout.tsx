import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ScrollToTop from "@/components/ScrollToTop";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";
import { SITE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
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
  alternates: {
    canonical: SITE.url,
  },
  icons: {
    icon: "/images/favicon.svg",
    shortcut: "/images/favicon.svg",
    apple: "/images/favicon.svg",
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
        <Analytics />
      </body>
    </html>
  );
}
