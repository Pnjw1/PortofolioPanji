"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Eye,
  Users,
  Mail,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  FileText,
  AlertTriangle,
  Briefcase,
  TerminalSquare,
  Award,
  BookOpen,
} from "lucide-react";

export interface PageViewRecord {
  path: string;
  referrer: string | null;
  device_type: string | null;
  visitor_hash: string;
  created_at: string;
}

export interface ContentCounts {
  projects: number;
  posts: number;
  publishedPosts: number;
  tech: number;
  certificates: number;
  experiences: number;
  totalMessages: number;
  unreadMessages: number;
}

interface AdminAnalyticsDashboardProps {
  pageviews: PageViewRecord[];
  counts: ContentCounts;
  analyticsTableMissing: boolean;
}

function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${Number(day)} ${months[Number(month) - 1] || month}`;
}

function getDateKeyWIB(dateInput: Date | string): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  // Geser ke WIB (UTC+7) agar pengelompokan harian sesuai waktu Indonesia Barat
  const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

export default function AdminAnalyticsDashboard({
  pageviews,
  counts,
  analyticsTableMissing,
}: AdminAnalyticsDashboardProps) {
  const router = useRouter();
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const analytics = useMemo(() => {
    const now = new Date();
    const dateKeys: string[] = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dateKeys.push(getDateKeyWIB(d));
    }

    const startKey = dateKeys[0];
    const todayKey = dateKeys[dateKeys.length - 1];

    const filtered = pageviews.filter((pv) => getDateKeyWIB(pv.created_at) >= startKey);

    const dailyMap = new Map<string, { views: number; visitors: Set<string> }>();
    for (const key of dateKeys) {
      dailyMap.set(key, { views: 0, visitors: new Set() });
    }

    const uniqueAll = new Set<string>();
    const pathCounts = new Map<string, number>();
    const referrerCounts = new Map<string, number>();
    const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };

    let todayViews = 0;

    for (const pv of filtered) {
      const key = getDateKeyWIB(pv.created_at);
      if (key === todayKey) todayViews++;

      const bucket = dailyMap.get(key);
      if (bucket) {
        bucket.views += 1;
        bucket.visitors.add(pv.visitor_hash);
      }

      uniqueAll.add(pv.visitor_hash);
      pathCounts.set(pv.path, (pathCounts.get(pv.path) || 0) + 1);

      const ref = pv.referrer || "Direct";
      referrerCounts.set(ref, (referrerCounts.get(ref) || 0) + 1);

      const dev = (pv.device_type || "desktop").toLowerCase();
      if (dev === "mobile") deviceCounts.mobile += 1;
      else if (dev === "tablet") deviceCounts.tablet += 1;
      else deviceCounts.desktop += 1;
    }

    const dailySeries = dateKeys.map((date) => {
      const entry = dailyMap.get(date)!;
      return {
        date,
        label: formatShortDate(date),
        views: entry.views,
        visitors: entry.visitors.size,
      };
    });

    const maxViews = Math.max(...dailySeries.map((d) => d.views), 1);

    const topPages = Array.from(pathCounts.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    const topReferrers = Array.from(referrerCounts.entries())
      .map(([source, views]) => ({ source, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const totalViews = filtered.length;
    const totalVisitors = uniqueAll.size;
    const avgPagesPerVisitor =
      totalVisitors > 0 ? (totalViews / totalVisitors).toFixed(1) : "0.0";

    return {
      dailySeries,
      maxViews,
      totalViews,
      todayViews,
      totalVisitors,
      avgPagesPerVisitor,
      topPages,
      topReferrers,
      deviceCounts,
    };
  }, [pageviews, rangeDays]);

  const totalContent = counts.projects + counts.publishedPosts + counts.certificates;
  const totalDevices =
    analytics.deviceCounts.desktop +
    analytics.deviceCounts.mobile +
    analytics.deviceCounts.tablet;

  const devicePct = (count: number) =>
    totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0;

  const quickLinks = [
    {
      href: "/admin/projects",
      title: "Proyek",
      count: counts.projects,
      subtitle: "Studi kasus & portofolio",
      icon: Briefcase,
      accent: "text-purple-400 hover:border-purple-500/40",
    },
    {
      href: "/admin/blog",
      title: "Artikel Blog",
      count: counts.publishedPosts,
      subtitle: `${counts.posts} total (${counts.posts - counts.publishedPosts} draf)`,
      icon: BookOpen,
      accent: "text-orange-400 hover:border-orange-500/40",
    },
    {
      href: "/admin/tech",
      title: "Tech Stack",
      count: counts.tech,
      subtitle: "Keahlian & perangkat",
      icon: TerminalSquare,
      accent: "text-cyan-400 hover:border-cyan-500/40",
    },
    {
      href: "/admin/certificates",
      title: "Sertifikat",
      count: counts.certificates,
      subtitle: "Lisensi & pencapaian",
      icon: Award,
      accent: "text-emerald-400 hover:border-emerald-500/40",
    },
    {
      href: "/admin/experience",
      title: "Pengalaman",
      count: counts.experiences,
      subtitle: "Riwayat organisasi & kerja",
      icon: Layers,
      accent: "text-amber-400 hover:border-amber-500/40",
    },
    {
      href: "/admin/messages",
      title: "Pesan Masuk",
      count: counts.totalMessages,
      subtitle:
        counts.unreadMessages > 0
          ? `${counts.unreadMessages} belum dibaca`
          : "Semua sudah dibaca",
      icon: Mail,
      accent: "text-yellow-400 hover:border-yellow-500/40",
    },
  ];

  // Dimensi chart SVG
  const chartWidth = 720;
  const chartHeight = 220;
  const padX = 28;
  const padTop = 20;
  const padBottom = 30;
  const plotW = chartWidth - padX * 2;
  const plotH = chartHeight - padTop - padBottom;

  const points = analytics.dailySeries.map((d, idx) => {
    const x =
      analytics.dailySeries.length === 1
        ? padX + plotW / 2
        : padX + (idx / (analytics.dailySeries.length - 1)) * plotW;
    const yViews = padTop + plotH - (d.views / analytics.maxViews) * plotH;
    const yVisitors = padTop + plotH - (d.visitors / analytics.maxViews) * plotH;
    return { ...d, x, yViews, yVisitors };
  });

  const viewsLinePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.yViews.toFixed(1)}`)
    .join(" ");

  const viewsAreaPath =
    points.length > 0
      ? `${viewsLinePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : "";

  const visitorsLinePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.yVisitors.toFixed(1)}`)
    .join(" ");

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="text-cyan-400 shrink-0" />
            Dashboard &amp; Analytics
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Ringkasan trafik kunjungan, pesan masuk, dan konten portofolio panjiwiguna.site.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-zinc-800 bg-[#121212] p-1">
            <button
              type="button"
              onClick={() => setRangeDays(7)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                rangeDays === 7
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setRangeDays(30)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                rangeDays === 30
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              30 Hari
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-800 bg-[#121212] text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            title="Muat ulang data"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Muat Ulang
          </button>

          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          >
            Google Analytics
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Notice jika tabel portfolio_pageviews belum dibuat di Supabase */}
      {analyticsTableMissing && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-amber-200 space-y-1">
            <p className="font-semibold">Tabel analytics belum aktif di Supabase.</p>
            <p className="text-amber-200/80">
              Jalankan blok SQL <code className="font-mono text-amber-100">portfolio_pageviews</code> dari file{" "}
              <code className="font-mono text-amber-100">supabase_contact_setup.sql</code> di Supabase SQL Editor agar
              grafik kunjungan mulai merekam data otomatis.
            </p>
          </div>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Total Kunjungan ({rangeDays}h)
            </span>
            <Eye size={16} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white tabular-nums">
            {analytics.totalViews.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-zinc-400">
            Hari ini: <span className="text-cyan-300 font-medium">{analytics.todayViews}</span> kunjungan
          </p>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Pengunjung Unik ({rangeDays}h)
            </span>
            <Users size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white tabular-nums">
            {analytics.totalVisitors.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-zinc-400">
            Rata-rata <span className="text-emerald-300 font-medium">{analytics.avgPagesPerVisitor}</span> hal/pengunjung
          </p>
        </div>

        <Link
          href="/admin/messages"
          className="bg-[#121212] border border-zinc-800 hover:border-yellow-500/40 rounded-xl p-5 space-y-3 transition-colors block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Pesan Masuk
            </span>
            <Mail size={16} className="text-yellow-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tabular-nums">
              {counts.totalMessages}
            </span>
            {counts.unreadMessages > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                {counts.unreadMessages} baru
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            {counts.unreadMessages > 0
              ? "Klik untuk membuka kotak masuk"
              : "Semua pesan sudah dibaca"}
          </p>
        </Link>

        <div className="bg-[#121212] border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Konten Terpublikasi
            </span>
            <Layers size={16} className="text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white tabular-nums">{totalContent}</div>
          <p className="text-xs text-zinc-400">
            {counts.projects} proyek · {counts.publishedPosts} artikel · {counts.certificates} sertifikat
          </p>
        </div>
      </div>

      {/* Traffic Trend Chart */}
      <div className="bg-[#121212] border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white">Tren Kunjungan Harian</h2>
            <p className="text-xs text-zinc-400">
              {activePoint
                ? `${activePoint.label}: ${activePoint.views} kunjungan, ${activePoint.visitors} pengunjung unik`
                : `Arahkan kursor ke grafik untuk melihat detail ${rangeDays} hari terakhir`}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Kunjungan
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Pengunjung Unik
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full min-w-[460px] h-56 select-none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Garis grid horizontal */}
            {[0, 0.5, 1].map((ratio) => {
              const y = padTop + plotH * (1 - ratio);
              const val = Math.round(analytics.maxViews * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={padX}
                    y1={y}
                    x2={chartWidth - padX}
                    y2={y}
                    stroke="#27272a"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padX - 6}
                    y={y + 4}
                    textAnchor="end"
                    fill="#71717a"
                    fontSize="10"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area & Line Kunjungan */}
            {viewsAreaPath && <path d={viewsAreaPath} fill="url(#viewsGradient)" />}
            {viewsLinePath && (
              <path
                d={viewsLinePath}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Line Pengunjung Unik */}
            {visitorsLinePath && (
              <path
                d={visitorsLinePath}
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Titik & zona hover */}
            {points.map((p, idx) => {
              const showLabel =
                rangeDays === 7 || idx === 0 || idx === points.length - 1 || idx % 5 === 0;
              const isHovered = hoveredIndex === idx;
              const hitWidth = plotW / Math.max(points.length, 1);

              return (
                <g key={p.date} onMouseEnter={() => setHoveredIndex(idx)}>
                  {isHovered && (
                    <line
                      x1={p.x}
                      y1={padTop}
                      x2={p.x}
                      y2={padTop + plotH}
                      stroke="#3f3f46"
                      strokeWidth="1"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.yViews}
                    r={isHovered ? 5 : rangeDays === 7 ? 3.5 : 2.2}
                    fill="#22d3ee"
                  />
                  <circle
                    cx={p.x}
                    cy={p.yVisitors}
                    r={isHovered ? 4.5 : rangeDays === 7 ? 3 : 2}
                    fill="#34d399"
                  />
                  {showLabel && (
                    <text
                      x={p.x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      fill={isHovered ? "#e4e4e7" : "#71717a"}
                      fontSize="10"
                    >
                      {p.label}
                    </text>
                  )}
                  <rect
                    x={p.x - hitWidth / 2}
                    y={padTop}
                    width={hitWidth}
                    height={plotH}
                    fill="transparent"
                    className="cursor-pointer"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Breakdown: Halaman Terpopuler + Sumber Trafik & Perangkat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-[#121212] border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText size={16} className="text-cyan-400" />
              Halaman Terpopuler
            </h2>
            <span className="text-xs text-zinc-500">{rangeDays} hari terakhir</span>
          </div>

          {analytics.topPages.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">
              Belum ada data kunjungan tercatat pada rentang ini.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.topPages.map((item) => {
                const maxPageViews = analytics.topPages[0].views || 1;
                const pct = Math.max(6, Math.round((item.views / maxPageViews) * 100));
                return (
                  <div key={item.path} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-mono text-zinc-200 truncate" title={item.path}>
                        {item.path}
                      </span>
                      <span className="text-zinc-400 tabular-nums shrink-0">
                        {item.views}x
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-500/80"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Referrer & Devices */}
        <div className="bg-[#121212] border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-6">
          {/* Referrers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Globe size={16} className="text-emerald-400" />
                Sumber Trafik
              </h2>
              <span className="text-xs text-zinc-500">Referrer</span>
            </div>

            {analytics.topReferrers.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">
                Belum ada data sumber trafik.
              </p>
            ) : (
              <div className="space-y-2.5">
                {analytics.topReferrers.map((ref) => {
                  const pct =
                    analytics.totalViews > 0
                      ? Math.round((ref.views / analytics.totalViews) * 100)
                      : 0;
                  return (
                    <div key={ref.source} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-200 truncate">{ref.source}</span>
                      <span className="text-zinc-400 tabular-nums">
                        {ref.views} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device Breakdown */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <h3 className="text-sm font-semibold text-white">Perangkat Pengunjung</h3>
            <div className="h-2.5 w-full rounded-full bg-zinc-900 overflow-hidden flex">
              <div
                className="bg-cyan-400 h-full"
                style={{ width: `${devicePct(analytics.deviceCounts.desktop)}%` }}
              />
              <div
                className="bg-emerald-400 h-full"
                style={{ width: `${devicePct(analytics.deviceCounts.mobile)}%` }}
              />
              <div
                className="bg-purple-400 h-full"
                style={{ width: `${devicePct(analytics.deviceCounts.tablet)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Monitor size={14} className="text-cyan-400" />
                <span>Desktop {devicePct(analytics.deviceCounts.desktop)}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Smartphone size={14} className="text-emerald-400" />
                <span>Mobile {devicePct(analytics.deviceCounts.mobile)}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Tablet size={14} className="text-purple-400" />
                <span>Tablet {devicePct(analytics.deviceCounts.tablet)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan & Akses Cepat Konten */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white">Kelola Konten</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`bg-[#121212] border border-zinc-800 rounded-xl p-5 flex items-center justify-between transition-colors ${item.accent}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    <span className="font-semibold text-zinc-100">{item.title}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-white tabular-nums">{item.count}</span>
                  <ArrowRight size={15} className="text-zinc-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
