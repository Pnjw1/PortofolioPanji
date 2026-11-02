import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BlogNotFound() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center">
      <div className="text-center space-y-6 px-6">
        <div className="space-y-2">
          <p className="text-red-400 text-sm font-mono tracking-widest">ERROR 404</p>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-500">
            Artikel Tidak Ditemukan
          </h1>
          <p className="text-zinc-500 text-sm font-mono mt-4">
            Artikel yang kamu cari tidak ada atau belum dipublikasikan.
          </p>
        </div>

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 rounded-xl font-bold hover:bg-cyan-500/20 hover:border-cyan-500 transition-all duration-300"
        >
          <ArrowLeft size={18} />
          Kembali ke Blog
        </Link>
      </div>
    </main>
  );
}
