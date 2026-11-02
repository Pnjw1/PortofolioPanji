"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Trash2, Plus, Pencil, X, Check, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function BlogManager() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();

  // Form
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase.from('portfolio_posts').select('*').order('created_at', { ascending: false });
    if (data) setList(data);
    setLoading(false);
  }

  function autoSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let coverUrl = null;
    if (coverFile) {
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `blog_${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, coverFile);
      if (uploadError) { toast('Upload gagal: ' + uploadError.message, 'error'); setSaving(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
      coverUrl = publicUrl;
    }

    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');
    const finalSlug = slug || autoSlug(title);

    const { error } = await supabase.from('portfolio_posts').insert([{
      title, slug: finalSlug, excerpt: excerpt || null, content,
      cover_url: coverUrl, tags: tagArray,
      is_published: isPublished, published_at: isPublished ? new Date().toISOString() : null,
    }]);

    if (!error) {
      setTitle(''); setSlug(''); setExcerpt(''); setContent(''); setTags('');
      setCoverFile(null); setIsPublished(false);
      const el = document.getElementById('cover-upload') as HTMLInputElement;
      if (el) el.value = '';
      fetchData();
      toast('Artikel berhasil ditambahkan!', 'success');
    } else { toast('Gagal: ' + error.message, 'error'); }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus artikel ini?")) return;
    const { error } = await supabase.from('portfolio_posts').delete().eq('id', id);
    if (!error) { fetchData(); toast('Artikel dihapus.', 'success'); }
    else toast('Gagal: ' + error.message, 'error');
  }

  async function togglePublish(item: any) {
    const newState = !item.is_published;
    const { error } = await supabase.from('portfolio_posts').update({
      is_published: newState,
      published_at: newState ? new Date().toISOString() : null,
    }).eq('id', item.id);
    if (!error) { fetchData(); toast(newState ? 'Artikel dipublikasi!' : 'Artikel disembunyikan.', 'success'); }
    else toast('Gagal: ' + error.message, 'error');
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setEditData({
      title: item.title, slug: item.slug, excerpt: item.excerpt || '',
      content: item.content, tags: item.tags?.join(', ') || '',
    });
  }

  async function saveEdit(id: number) {
    const tagArray = editData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
    const { error } = await supabase.from('portfolio_posts').update({
      title: editData.title, slug: editData.slug, excerpt: editData.excerpt || null,
      content: editData.content, tags: tagArray,
    }).eq('id', id);
    if (!error) { setEditingId(null); fetchData(); toast('Perubahan disimpan!', 'success'); }
    else toast('Gagal: ' + error.message, 'error');
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="text-orange-500" />
          Manage Blog
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">Tulis dan kelola artikel, tutorial, dan sharing.</p>
      </div>

      {/* ADD FORM */}
      <div className="bg-[#121212] border border-zinc-800 p-4 md:p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus size={18} className="text-orange-400" /> Tulis Artikel Baru
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Judul</label>
              <input type="text" required value={title} onChange={e => { setTitle(e.target.value); if (!slug) setSlug(autoSlug(e.target.value)); }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Slug (URL)</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
                placeholder="auto-generated"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
              <p className="text-xs text-zinc-600 mt-1">/blog/{slug || 'auto'}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1">Ringkasan (untuk SEO & preview)</label>
            <input type="text" value={excerpt} onChange={e => setExcerpt(e.target.value)}
              placeholder="1-2 kalimat tentang isi artikel"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1">Konten (Markdown)</label>
            <textarea required value={content} onChange={e => setContent(e.target.value)} rows={10}
              placeholder={"## Pengenalan\n\nTulis artikel kamu di sini dengan format **Markdown**.\n\n### Sub-judul\n\n- List item 1\n- List item 2\n\n`kode inline`\n\n```\nblok kode\n```"}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-orange-500 font-mono" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Tags (comma separated)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                placeholder="Next.js, Tutorial, Web Dev"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Cover Image (opsional)</label>
              <input id="cover-upload" type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500 file:text-white" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-orange-500" />
              <span className="text-sm text-zinc-400">Langsung publish</span>
            </label>
          </div>

          <button type="submit" disabled={saving}
            className="w-full sm:w-auto px-6 py-2 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-lg transition-colors text-sm">
            {saving ? "..." : "Simpan Artikel"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Daftar Artikel ({list.length})</h2>
        </div>

        <div className="divide-y divide-zinc-800/50">
          {loading ? (
            <div className="p-6 text-center text-zinc-500">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">Belum ada artikel.</div>
          ) : (
            list.map((item) => (
              <div key={item.id} className="p-4 md:p-5 hover:bg-zinc-800/10 transition-colors">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})}
                        placeholder="Judul" className="bg-zinc-900 border border-orange-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                      <input value={editData.slug} onChange={e => setEditData({...editData, slug: e.target.value})}
                        placeholder="Slug" className="bg-zinc-900 border border-orange-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    </div>
                    <input value={editData.excerpt} onChange={e => setEditData({...editData, excerpt: e.target.value})}
                      placeholder="Ringkasan" className="w-full bg-zinc-900 border border-orange-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    <textarea value={editData.content} onChange={e => setEditData({...editData, content: e.target.value})}
                      rows={8} className="w-full bg-zinc-900 border border-orange-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none font-mono" />
                    <input value={editData.tags} onChange={e => setEditData({...editData, tags: e.target.value})}
                      placeholder="Tags" className="w-full bg-zinc-900 border border-orange-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(item.id)} className="px-4 py-1.5 bg-emerald-500 text-black rounded-lg text-sm font-bold flex items-center gap-1"><Check size={14} /> Simpan</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm flex items-center gap-1"><X size={14} /> Batal</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white truncate">{item.title}</h3>
                        {item.is_published ? (
                          <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-mono">PUBLISHED</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-zinc-600/10 text-zinc-500 border border-zinc-600/30 rounded font-mono">DRAFT</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{item.excerpt || item.content?.slice(0, 80) + '...'}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.tags?.map((t: string) => (
                          <span key={t} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded font-mono">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.is_published && (
                        <a href={`/blog/${item.slug}`} target="_blank" className="p-2 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors" title="Preview">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button onClick={() => togglePublish(item)}
                        className={`p-2 rounded-lg transition-colors ${item.is_published ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10' : 'text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10'}`}
                        title={item.is_published ? 'Sembunyikan' : 'Publish'}>
                        {item.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => startEdit(item)} className="p-2 text-zinc-500 hover:text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors" title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
