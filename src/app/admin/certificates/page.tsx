"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Award, Trash2, Plus, FolderOpen, ExternalLink, Pencil, X, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function CertificatesManager() {
  const [certList, setCertList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Form states
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [year, setYear] = useState('Active');
  const [link, setLink] = useState('');
  const [certType, setCertType] = useState<'link' | 'group'>('link');
  const [slug, setSlug] = useState('');
  const [parentSlug, setParentSlug] = useState('');

  const randomStyles = [
    { color: 'from-blue-500/20 to-cyan-500/20', border: 'group-hover:border-cyan-500/50', glow: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]' },
    { color: 'from-green-500/20 to-emerald-500/20', border: 'group-hover:border-emerald-500/50', glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
    { color: 'from-blue-600/20 to-indigo-500/20', border: 'group-hover:border-indigo-500/50', glow: 'group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' },
    { color: 'from-purple-500/20 to-fuchsia-500/20', border: 'group-hover:border-fuchsia-500/50', glow: 'group-hover:shadow-[0_0_30px_rgba(217,70,239,0.15)]' },
    { color: 'from-yellow-500/20 to-amber-500/20', border: 'group-hover:border-amber-500/50', glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]' },
    { color: 'from-pink-500/20 to-rose-500/20', border: 'group-hover:border-rose-500/50', glow: 'group-hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]' },
  ];

  useEffect(() => { fetchCerts(); }, []);

  async function fetchCerts() {
    setLoading(true);
    const { data } = await supabase.from('portfolio_certificates').select('*').order('created_at', { ascending: false });
    if (data) setCertList(data);
    setLoading(false);
  }

  const groupCerts = certList.filter(c => c.type === 'group');
  const topLevel = certList.filter(c => !c.parent_slug);
  const childrenMap: Record<string, any[]> = {};
  certList.filter(c => c.parent_slug).forEach(c => {
    if (!childrenMap[c.parent_slug]) childrenMap[c.parent_slug] = [];
    childrenMap[c.parent_slug].push(c);
  });

  function toggleGroup(slug: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const autoStyle = randomStyles[Math.floor(Math.random() * randomStyles.length)];

    const insertData: any = {
      title, issuer, year,
      color_class: autoStyle.color, border_class: autoStyle.border, glow_class: autoStyle.glow,
      type: parentSlug ? 'link' : certType,
    };

    if (certType === 'group' && !parentSlug) {
      insertData.slug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      insertData.link = null;
    } else {
      insertData.link = link;
    }

    if (parentSlug) { insertData.parent_slug = parentSlug; }

    const { error } = await supabase.from('portfolio_certificates').insert([insertData]);
    if (!error) {
      setTitle(''); setIssuer(''); setYear('Active'); setLink('');
      setCertType('link'); setSlug(''); setParentSlug('');
      fetchCerts();
      toast('Sertifikat berhasil ditambahkan!', 'success');
    } else { toast('Gagal: ' + error.message, 'error'); }
    setSaving(false);
  }

  async function handleDelete(id: number, type: string, itemSlug: string) {
    const isGroup = type === 'group';
    if (!confirm(isGroup ? "Hapus grup beserta SEMUA sertifikat di dalamnya?" : "Hapus sertifikat ini?")) return;
    if (isGroup && itemSlug) {
      await supabase.from('portfolio_certificates').delete().eq('parent_slug', itemSlug);
    }
    const { error } = await supabase.from('portfolio_certificates').delete().eq('id', id);
    if (!error) { fetchCerts(); toast('Sertifikat berhasil dihapus.', 'success'); }
    else toast('Gagal menghapus: ' + error.message, 'error');
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setEditData({ title: item.title, issuer: item.issuer, year: item.year, link: item.link || '' });
  }

  async function saveEdit(id: number) {
    const { error } = await supabase.from('portfolio_certificates').update({
      title: editData.title, issuer: editData.issuer, year: editData.year, link: editData.link || null,
    }).eq('id', id);
    if (!error) { setEditingId(null); fetchCerts(); toast('Perubahan berhasil disimpan!', 'success'); }
    else toast('Gagal menyimpan: ' + error.message, 'error');
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Award className="text-emerald-500" />
          Manage Certificates
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">Kelola sertifikat: buat grup (folder) atau sertifikat langsung.</p>
      </div>

      {/* ADD FORM */}
      <div className="bg-[#121212] border border-zinc-800 p-4 md:p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus size={18} className="text-emerald-400" /> Tambah Sertifikat
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { setCertType('link'); setParentSlug(''); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                certType === 'link' && !parentSlug ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}>
              <ExternalLink size={14} /> Link Langsung
            </button>
            <button type="button" onClick={() => { setCertType('group'); setParentSlug(''); setLink(''); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                certType === 'group' && !parentSlug ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}>
              <FolderOpen size={14} /> Buat Grup
            </button>
          </div>

          {/* Parent Group Selector */}
          {certType === 'link' && groupCerts.length > 0 && (
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Masukkan ke Grup (Opsional)</label>
              <select value={parentSlug} onChange={e => setParentSlug(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500">
                <option value="">— Tampil di Beranda —</option>
                {groupCerts.map(g => <option key={g.slug} value={g.slug}>📁 {g.title}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1">Issuer</label>
                <input type="text" required value={issuer} onChange={e => setIssuer(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1">Year</label>
                <input type="text" required value={year} onChange={e => setYear(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
              </div>
            </div>
          </div>

          {(certType === 'link' || parentSlug) && (
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Verification Link</label>
              <input type="url" required value={link} onChange={e => setLink(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
            </div>
          )}

          {certType === 'group' && !parentSlug && (
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Slug (URL)</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="otomatis dari title"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500" />
              <p className="text-xs text-zinc-600 mt-1">/certificates/{slug || 'auto'}</p>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full sm:w-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-colors text-sm">
            {saving ? "..." : certType === 'group' && !parentSlug ? "Buat Grup" : "Tambah"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Daftar Sertifikat ({certList.length})</h2>
        </div>

        <div className="divide-y divide-zinc-800/50">
          {loading ? (
            <div className="p-6 text-center text-zinc-500">Loading...</div>
          ) : topLevel.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">Belum ada sertifikat.</div>
          ) : (
            topLevel.map((item) => {
              const isGroup = item.type === 'group';
              const children = childrenMap[item.slug] || [];
              const isExpanded = expandedGroups.has(item.slug);

              return (
                <div key={item.id}>
                  {/* Main row */}
                  <div className="p-4 md:p-5 hover:bg-zinc-800/10 transition-colors">
                    {editingId === item.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})}
                            placeholder="Title" className="bg-zinc-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                          <input value={editData.issuer} onChange={e => setEditData({...editData, issuer: e.target.value})}
                            placeholder="Issuer" className="bg-zinc-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                          <input value={editData.year} onChange={e => setEditData({...editData, year: e.target.value})}
                            placeholder="Year" className="bg-zinc-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                        {!isGroup && (
                          <input value={editData.link} onChange={e => setEditData({...editData, link: e.target.value})}
                            placeholder="Link" className="w-full bg-zinc-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        )}
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(item.id)} className="px-4 py-1.5 bg-emerald-500 text-black rounded-lg text-sm font-bold flex items-center gap-1">
                            <Check size={14} /> Simpan
                          </button>
                          <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm flex items-center gap-1">
                            <X size={14} /> Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {isGroup && (
                              <button onClick={() => toggleGroup(item.slug)} className="p-1 text-zinc-500 hover:text-white shrink-0">
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                            )}
                            {isGroup && <FolderOpen size={16} className="text-purple-400 shrink-0" />}
                            <h3 className="font-semibold text-white truncate">{item.title}</h3>
                            {isGroup && (
                              <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded font-mono shrink-0">
                                {children.length}
                              </span>
                            )}
                            {!isGroup && (
                              <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-mono shrink-0">
                                LINK
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">{item.issuer} · {item.year}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => startEdit(item)} className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id, item.type, item.slug)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Children (collapsible) */}
                  {isGroup && isExpanded && children.map(child => (
                    <div key={child.id} className="pl-8 md:pl-12 pr-4 md:pr-5 py-3 bg-zinc-900/30 hover:bg-zinc-800/20 transition-colors border-t border-zinc-800/30">
                      {editingId === child.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})}
                              className="bg-zinc-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                            <input value={editData.issuer} onChange={e => setEditData({...editData, issuer: e.target.value})}
                              className="bg-zinc-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                            <input value={editData.year} onChange={e => setEditData({...editData, year: e.target.value})}
                              className="bg-zinc-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                          </div>
                          <input value={editData.link} onChange={e => setEditData({...editData, link: e.target.value})}
                            placeholder="Link" className="w-full bg-zinc-900 border border-emerald-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(child.id)} className="px-4 py-1.5 bg-emerald-500 text-black rounded-lg text-sm font-bold flex items-center gap-1"><Check size={14} /> Simpan</button>
                            <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm flex items-center gap-1"><X size={14} /> Batal</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-300 truncate">↳ {child.title}</p>
                            <p className="text-xs text-zinc-500">{child.issuer} · {child.year}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => startEdit(child)} className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Edit">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(child.id, child.type, child.slug)} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
