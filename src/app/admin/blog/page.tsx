"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Trash2, Plus, Pencil, X, Check, Eye, EyeOff, ExternalLink, Headphones, ImagePlus, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { extractMusicFromContent } from '@/components/ArticleReader';

function buildContentWithMusic(body: string, musicUrl: string, musicTitle: string): string {
  const cleanBody = extractMusicFromContent(body).cleanBody;
  const trimmedUrl = musicUrl.trim();
  if (!trimmedUrl) return cleanBody;
  const trimmedTitle = musicTitle.trim();
  const tag = trimmedTitle ? `[music](${trimmedUrl}|${trimmedTitle})` : `[music](${trimmedUrl})`;
  return `${tag}\n\n${cleanBody}`;
}

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
  const [musicUrl, setMusicUrl] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [tags, setTags] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [uploadingEditInline, setUploadingEditInline] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingEditAudio, setUploadingEditAudio] = useState(false);

  const addTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const addInlineInputRef = useRef<HTMLInputElement>(null);
  const editInlineInputRef = useRef<HTMLInputElement>(null);
  const addAudioInputRef = useRef<HTMLInputElement>(null);
  const editAudioInputRef = useRef<HTMLInputElement>(null);

  async function uploadAudioFile(file: File): Promise<string | null> {
    if (file.size > 15 * 1024 * 1024) {
      toast('Ukuran file audio maksimal 15 MB.', 'error');
      return null;
    }
    const fileExt = file.name.split('.').pop() || 'mp3';
    const fileName = `blog_audio_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('portfolio_images')
      .upload(fileName, file, { contentType: file.type || 'audio/mpeg' });
    if (uploadError) {
      toast('Upload audio gagal: ' + uploadError.message, 'error');
      return null;
    }
    const { data: { publicUrl } } = supabase.storage
      .from('portfolio_images')
      .getPublicUrl(fileName);
    return publicUrl;
  }

  async function handleUploadAudioAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    const url = await uploadAudioFile(file);
    if (url) {
      setMusicUrl(url);
      if (!musicTitle.trim()) {
        setMusicTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '));
      }
      toast('File audio berhasil diunggah!', 'success');
    }
    e.target.value = '';
    setUploadingAudio(false);
  }

  async function handleUploadAudioEdit(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEditAudio(true);
    const url = await uploadAudioFile(file);
    if (url) {
      const fallbackTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      setEditData((prev: any) => ({
        ...prev,
        musicUrl: url,
        musicTitle: prev.musicTitle?.trim() ? prev.musicTitle : fallbackTitle,
      }));
      toast('File audio berhasil diunggah!', 'success');
    }
    e.target.value = '';
    setUploadingEditAudio(false);
  }

  async function uploadInlineImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `blog_inline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('portfolio_images')
      .upload(fileName, file);
    if (uploadError) {
      toast('Upload foto gagal: ' + uploadError.message, 'error');
      return null;
    }
    const { data: { publicUrl } } = supabase.storage
      .from('portfolio_images')
      .getPublicUrl(fileName);
    return publicUrl;
  }

  function insertMarkdownAtCursor(
    currentText: string,
    textarea: HTMLTextAreaElement | null,
    snippet: string
  ): string {
    if (!textarea) {
      return currentText ? `${currentText}\n\n${snippet}\n` : `${snippet}\n`;
    }
    const start = textarea.selectionStart ?? currentText.length;
    const end = textarea.selectionEnd ?? currentText.length;
    const before = currentText.slice(0, start);
    const after = currentText.slice(end);
    const prefix = before && !before.endsWith('\n') ? '\n\n' : before ? '\n' : '';
    const suffix = after && !after.startsWith('\n') ? '\n\n' : '\n';
    return `${before}${prefix}${snippet}${suffix}${after}`;
  }

  async function handleInsertInlineAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInline(true);
    const url = await uploadInlineImage(file);
    if (url) {
      const defaultCaption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      const snippet = `![${defaultCaption}](${url})`;
      setContent((prev) => insertMarkdownAtCursor(prev, addTextareaRef.current, snippet));
      toast('Foto berhasil disisipkan ke konten!', 'success');
    }
    e.target.value = '';
    setUploadingInline(false);
  }

  async function handleInsertInlineEdit(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEditInline(true);
    const url = await uploadInlineImage(file);
    if (url) {
      const defaultCaption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      const snippet = `![${defaultCaption}](${url})`;
      setEditData((prev: any) => ({
        ...prev,
        content: insertMarkdownAtCursor(prev.content || '', editTextareaRef.current, snippet),
      }));
      toast('Foto berhasil disisipkan ke konten!', 'success');
    }
    e.target.value = '';
    setUploadingEditInline(false);
  }

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
      const fileName = `blog_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, coverFile);
      if (uploadError) {
        toast('Upload sampul gagal: ' + uploadError.message, 'error');
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
      coverUrl = publicUrl;
    }

    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');
    const finalSlug = slug || autoSlug(title);
    const finalContent = buildContentWithMusic(content, musicUrl, musicTitle);

    const { error } = await supabase.from('portfolio_posts').insert([{
      title,
      slug: finalSlug,
      excerpt: excerpt || null,
      content: finalContent,
      cover_url: coverUrl,
      tags: tagArray,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    }]);

    if (!error) {
      setTitle(''); setSlug(''); setExcerpt(''); setContent(''); setTags('');
      setMusicUrl(''); setMusicTitle('');
      setCoverFile(null); setIsPublished(false);
      const el = document.getElementById('cover-upload') as HTMLInputElement;
      if (el) el.value = '';
      fetchData();
      toast('Artikel berhasil ditambahkan!', 'success');
    } else {
      toast('Gagal: ' + error.message, 'error');
    }
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
    if (!error) { fetchData(); toast(newState ? 'Artikel dipublikasikan!' : 'Artikel disembunyikan.', 'success'); }
    else toast('Gagal: ' + error.message, 'error');
  }

  function startEdit(item: any) {
    const parsed = extractMusicFromContent(item.content || '');
    setEditingId(item.id);
    setEditData({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: parsed.cleanBody,
      musicUrl: parsed.musicUrl || '',
      musicTitle: parsed.musicTitle || '',
      tags: item.tags?.join(', ') || '',
    });
  }

  async function saveEdit(id: number) {
    const tagArray = editData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
    const finalContent = buildContentWithMusic(editData.content, editData.musicUrl || '', editData.musicTitle || '');
    const { error } = await supabase.from('portfolio_posts').update({
      title: editData.title,
      slug: editData.slug,
      excerpt: editData.excerpt || null,
      content: finalContent,
      tags: tagArray,
    }).eq('id', id);
    if (!error) { setEditingId(null); fetchData(); toast('Perubahan disimpan!', 'success'); }
    else toast('Gagal: ' + error.message, 'error');
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="text-cyan-400" />
          Manage Jurnal &amp; Artikel
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Tulis artikel dengan gaya editorial dan tambahkan lagu pilihan (Spotify / YouTube / MP3) untuk menemani pembaca.
        </p>
      </div>

      {/* ADD FORM */}
      <div className="bg-[#121212] border border-zinc-800 p-4 md:p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus size={18} className="text-cyan-400" /> Tulis Artikel Baru
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Judul</label>
              <input type="text" required value={title}
                onChange={e => { setTitle(e.target.value); if (!slug) setSlug(autoSlug(e.target.value)); }}
                placeholder="Cara Membuat Website dengan Next.js"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Slug URL</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
                placeholder="cara-membuat-website-dengan-nextjs"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500 font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1">Subjudul / Ringkasan Singkat (Tampil di bawah judul)</label>
            <input type="text" value={excerpt} onChange={e => setExcerpt(e.target.value)}
              placeholder="Catatan singkat tentang proses perancangan dan hal yang dipelajari..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
          </div>

          {/* Musik / Lagu Teman Baca */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Headphones size={14} />
                <span>Lagu Teman Baca (Opsional — Spotify / YouTube / Upload MP3)</span>
              </div>
              <div>
                <input
                  ref={addAudioInputRef}
                  type="file"
                  accept="audio/*,.mp3,.m4a,.wav,.ogg"
                  onChange={handleUploadAudioAdd}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingAudio}
                  onClick={() => addAudioInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploadingAudio ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploadingAudio ? 'Mengunggah...' : 'Upload MP3'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="url"
                  value={musicUrl}
                  onChange={e => setMusicUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs sm:text-sm outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={musicTitle}
                  onChange={e => setMusicTitle(e.target.value)}
                  placeholder="Judul Lagu — Artis (Opsional)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs sm:text-sm outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-mono text-zinc-400">
                Konten (Mendukung: # Heading, **bold**, *italic*, `code`, - list, &gt; kutipan, ![keterangan](url))
              </label>
              <div>
                <input
                  ref={addInlineInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInsertInlineAdd}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingInline}
                  onClick={() => addInlineInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploadingInline ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                  {uploadingInline ? 'Mengunggah...' : 'Sisipkan Foto'}
                </button>
              </div>
            </div>
            <textarea
              ref={addTextareaRef}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={10}
              placeholder={"Tulis isi artikel di sini... Letakkan kursor di baris yang diinginkan lalu klik 'Sisipkan Foto' untuk menambahkan gambar di tengah artikel."}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500 font-mono leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Tags (pisah koma)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                placeholder="Next.js, Desain, Catatan"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Cover Image (opsional)</label>
              <input id="cover-upload" type="file" accept="image/*"
                onChange={e => setCoverFile(e.target.files?.[0] || null)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-white text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-cyan-500 file:text-black file:font-bold" />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-300">
                <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)}
                  className="rounded accent-cyan-500 w-4 h-4" />
                Langsung Publish
              </label>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors text-sm disabled:opacity-50 cursor-pointer">
            {saving ? "Menyimpan..." : "Simpan Artikel"}
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
            list.map(item => {
              const hasMusic = Boolean(extractMusicFromContent(item.content || '').musicUrl);
              return (
                <div key={item.id} className="p-4 md:p-5 hover:bg-zinc-800/10 transition-colors">
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})}
                          placeholder="Judul" className="bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        <input value={editData.slug} onChange={e => setEditData({...editData, slug: e.target.value})}
                          placeholder="Slug" className="bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none font-mono" />
                      </div>
                      <input value={editData.excerpt} onChange={e => setEditData({...editData, excerpt: e.target.value})}
                        placeholder="Subjudul / Ringkasan" className="w-full bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                      
                      <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                            <Headphones size={13} /> Lagu Teman Baca
                          </span>
                          <div>
                            <input
                              ref={editAudioInputRef}
                              type="file"
                              accept="audio/*,.mp3,.m4a,.wav,.ogg"
                              onChange={handleUploadAudioEdit}
                              className="hidden"
                            />
                            <button
                              type="button"
                              disabled={uploadingEditAudio}
                              onClick={() => editAudioInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {uploadingEditAudio ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                              {uploadingEditAudio ? 'Mengunggah...' : 'Upload MP3'}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input value={editData.musicUrl || ''} onChange={e => setEditData({...editData, musicUrl: e.target.value})}
                            placeholder="Link Lagu Spotify / YouTube / MP3 (Opsional)" className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs font-mono outline-none" />
                          <input value={editData.musicTitle || ''} onChange={e => setEditData({...editData, musicTitle: e.target.value})}
                            placeholder="Judul Lagu — Artis (Opsional)" className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs outline-none" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-zinc-400">Konten Artikel</span>
                          <div>
                            <input
                              ref={editInlineInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleInsertInlineEdit}
                              className="hidden"
                            />
                            <button
                              type="button"
                              disabled={uploadingEditInline}
                              onClick={() => editInlineInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {uploadingEditInline ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                              {uploadingEditInline ? 'Mengunggah...' : 'Sisipkan Foto'}
                            </button>
                          </div>
                        </div>
                        <textarea
                          ref={editTextareaRef}
                          value={editData.content}
                          onChange={e => setEditData({...editData, content: e.target.value})}
                          rows={8}
                          className="w-full bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none font-mono"
                        />
                      </div>
                      <input value={editData.tags} onChange={e => setEditData({...editData, tags: e.target.value})}
                        placeholder="Tags (pisah koma)" className="w-full bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(item.id)} className="px-4 py-1.5 bg-emerald-500 text-black rounded-lg text-sm font-bold flex items-center gap-1 cursor-pointer"><Check size={14} /> Simpan</button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm flex items-center gap-1 cursor-pointer"><X size={14} /> Batal</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white">{item.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded font-mono ${item.is_published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
                            {item.is_published ? 'Published' : 'Draft'}
                          </span>
                          {hasMusic && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              <Headphones size={11} /> Lagu
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 font-mono mt-1">/blog/{item.slug}</p>
                        {item.tags?.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {item.tags.map((t: string) => (
                              <span key={t} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded font-mono">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.is_published && (
                          <a href={`/blog/${item.slug}`} target="_blank"
                            className="p-2 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors" title="Lihat">
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button onClick={() => togglePublish(item)}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${item.is_published ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                          title={item.is_published ? "Unpublish" : "Publish"}>
                          {item.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => startEdit(item)} className="p-2 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors cursor-pointer" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
