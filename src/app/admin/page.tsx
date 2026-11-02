import { LayoutDashboard, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <LayoutDashboard className="text-cyan-400" />
          Dashboard Overview
        </h1>
        <p className="text-zinc-400 mt-2">
          Welcome back, Panji. Manage your portfolio content directly from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Tech Stack Card */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-zinc-100">Tech Stack</h3>
            <p className="text-sm text-zinc-400">Manage your skills, tools, and languages.</p>
          </div>
          <Link href="/admin/tech" className="mt-8 flex items-center gap-2 text-cyan-400 text-sm font-semibold hover:text-cyan-300">
            Manage Tech <ArrowRight size={16} />
          </Link>
        </div>

        {/* Projects Card */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl hover:border-purple-500/50 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-zinc-100">Projects</h3>
            <p className="text-sm text-zinc-400">Add or edit your featured portfolio projects.</p>
          </div>
          <Link href="/admin/projects" className="mt-8 flex items-center gap-2 text-purple-400 text-sm font-semibold hover:text-purple-300">
            Manage Projects <ArrowRight size={16} />
          </Link>
        </div>

        {/* Certificates Card */}
        <div className="bg-[#121212] border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-zinc-100">Certificates</h3>
            <p className="text-sm text-zinc-400">Showcase your digital badges and achievements.</p>
          </div>
          <Link href="/admin/certificates" className="mt-8 flex items-center gap-2 text-emerald-400 text-sm font-semibold hover:text-emerald-300">
            Manage Certificates <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
