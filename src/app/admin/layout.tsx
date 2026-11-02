"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, LogOut, TerminalSquare, Briefcase, Award, Menu, X, Mail } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { ToastProvider } from '@/components/Toast';

const navLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, color: 'text-zinc-400' },
  { href: '/admin/tech', label: 'Tech Stack', icon: TerminalSquare, color: 'text-cyan-500' },
  { href: '/admin/projects', label: 'Projects', icon: Briefcase, color: 'text-purple-500' },
  { href: '/admin/certificates', label: 'Certificates', icon: Award, color: 'text-emerald-500' },
  { href: '/admin/experience', label: 'Experience', icon: Briefcase, color: 'text-amber-500' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Award, color: 'text-pink-500' },
  { href: '/admin/blog', label: 'Blog', icon: Briefcase, color: 'text-orange-500' },
  { href: '/admin/messages', label: 'Pesan Masuk', icon: Mail, color: 'text-yellow-400' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoginPage) return;

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('portfolio_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');
      setUnreadCount(count || 0);
    };

    fetchUnread();

    const channel = supabase.channel('public:portfolio_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_messages' }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
    <div className="min-h-screen flex bg-[#0d0d0d] text-zinc-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 w-64 border-r border-zinc-800 bg-[#121212] transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col flex-1 p-6 space-y-8 h-full overflow-y-auto">
          {/* Logo + close button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-cyan-500">ADMIN</span>PANEL
              </h2>
              <p className="text-xs text-zinc-500 mt-1 font-mono">CMS Dashboard</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800/70 text-white'
                      : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={isActive ? 'text-cyan-400' : item.color} />
                    {item.label}
                  </div>
                  {item.href === '/admin/messages' && unreadCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1.5">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="pt-6 border-t border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                PW
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Panji Wiguna</p>
                <p className="text-xs text-zinc-500">Administrator</p>
              </div>
            </div>
            <form action={logout}>
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors border border-red-500/20">
                <LogOut size={16} />
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-w-0 bg-[#0d0d0d]">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg">
            <Menu size={20} />
          </button>
          <h2 className="text-sm font-bold text-white tracking-widest">
            <span className="text-cyan-500">ADMIN</span>PANEL
          </h2>
        </div>
        <div className="p-4 md:p-8 lg:p-12 w-full max-w-6xl mx-auto min-w-0 min-h-full">
          {children}
        </div>
      </main>
    </div>
    </ToastProvider>
  );
}
