"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, Trash2, Plus, Pencil, X, Check, ArrowUp, ArrowDown, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface Experience {
  id: number;
  title: string;
  company: string;
  type: string;
  year_range: string;
  description?: string;
  logo_url?: string;
  sort_order: number;
}

// Mengubah file gambar menjadi Data URL terkompresi (menjaga rasio asli landscape/portrait/persegi)
// Digunakan sebagai fallback otomatis jika Supabase Storage menolak upload karena RLS.
async function fileToCompressedDataUrl(file: File, maxDim = 240): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        // Gunakan PNG agar transparansi logo tetap terjaga
        resolve(canvas.toDataURL('image/png', 0.9));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadOrInlineLogo(file: File): Promise<string> {
  try {
    const fileExt = (file.name.split('.').pop() || 'png').replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `experience_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, file);
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
      if (publicUrl) return publicUrl;
    }
  } catch {
    // Lanjut ke fallback Data URL
  }
  return await fileToCompressedDataUrl(file, 240);
}

export default function ExperienceManager() {
  const [list, setList] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Experience>>({});
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState('Organisasi');
  const [yearRange, setYearRange] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('portfolio_experiences').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      if (data) setList(data);
    } catch (err: any) {
      toast('Gagal mengambil data: ' + err.message, 'error');
    }
    setLoading(false);
  }

  const handleSelectNewLogo = async (file: File | null) => {
    setLogoFile(file);
    if (file) {
      const preview = await fileToCompressedDataUrl(file, 240);
      setLogoPreview(preview);
    } else {
      setLogoPreview('');
    }
  };

  const handleSelectEditLogo = async (file: File | null) => {
    setEditLogoFile(file);
    if (file) {
      const preview = await fileToCompressedDataUrl(file, 240);
      setEditLogoPreview(preview);
    } else {
      setEditLogoPreview('');
    }
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      let logoUrl: string | null = null;
      if (logoFile) {
        logoUrl = await uploadOrInlineLogo(logoFile);
      }

      const payload: Record<string, any> = {
        title,
        company,
        type,
        year_range: yearRange,
        description: description || null,
        sort_order: list.length,
        logo_url: logoUrl,
      };

      let { error } = await supabase.from('portfolio_experiences').insert([payload]);

      // Jika kolom logo_url belum ada di tabel Supabase, beri peringatan jelas
      if (error && error.message?.includes('logo_url')) {
        toast('Kolom logo_url belum ada di Supabase. Jalankan ulang file supabase_contact_setup.sql di Supabase SQL Editor!', 'error');
        setSaving(false);
        return;
      }

      if (error) throw error;

      setTitle(''); setCompany(''); setType('Organisasi'); setYearRange(''); setDescription('');
      setLogoFile(null); setLogoPreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchData();
      toast('Pengalaman berhasil ditambahkan!', 'success');
    } catch (err: any) {
      toast('Gagal: ' + err.message, 'error');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus experience ini?")) return;
    try {
      const { error } = await supabase.from('portfolio_experiences').delete().eq('id', id);
      if (error) throw error;
      fetchData();
      toast('Experience dihapus.', 'success');
    } catch (err: any) {
      toast('Gagal: ' + err.message, 'error');
    }
  }

  function startEdit(item: Experience) {
    setEditingId(item.id);
    setEditData({ 
      title: item.title, 
      company: item.company, 
      type: item.type, 
      year_range: item.year_range, 
      description: item.description || '',
      logo_url: item.logo_url || ''
    });
    setEditLogoFile(null);
    setEditLogoPreview(item.logo_url || '');
  }

  async function saveEdit(id: number) {
    setSaving(true);
    try {
      let logoUrl = editData.logo_url || null;

      if (editLogoFile) {
        logoUrl = await uploadOrInlineLogo(editLogoFile);
      }

      const { error } = await supabase.from('portfolio_experiences').update({
        title: editData.title,
        company: editData.company,
        type: editData.type,
        year_range: editData.year_range,
        description: editData.description || null,
        logo_url: logoUrl,
      }).eq('id', id);

      if (error && error.message?.includes('logo_url')) {
        toast('Kolom logo_url belum ada di Supabase. Jalankan file supabase_contact_setup.sql di Supabase SQL Editor!', 'error');
        setSaving(false);
        return;
      }

      if (error) throw error;

      setEditingId(null);
      setEditLogoFile(null);
      setEditLogoPreview('');
      fetchData();
      toast('Perubahan beserta logo berhasil disimpan!', 'success');
    } catch (err: any) {
      toast('Gagal: ' + err.message, 'error');
    }
    setSaving(false);
  }

  async function moveItem(id: number, direction: 'up' | 'down') {
    const idx = list.findIndex(i => i.id === id);
    if (direction === 'up' && idx > 0) {
      await supabase.from('portfolio_experiences').update({ sort_order: idx - 1 }).eq('id', id);
      await supabase.from('portfolio_experiences').update({ sort_order: idx }).eq('id', list[idx - 1].id);
    } else if (direction === 'down' && idx < list.length - 1) {
      await supabase.from('portfolio_experiences').update({ sort_order: idx + 1 }).eq('id', id);
      await supabase.from('portfolio_experiences').update({ sort_order: idx }).eq('id', list[idx + 1].id);
    }
    fetchData();
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Briefcase className="text-cyan-500" />
          Manage Experience
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Kelola timeline pengalaman kerja &amp; organisasi. Mendukung semua ukuran logo (landscape, portrait, maupun persegi).
        </p>
      </div>

      {/* ADD FORM */}
      <div className="bg-[#121212] border border-zinc-800 p-4 md:p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus size={18} className="text-cyan-400" /> Tambah Experience
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Posisi/Role</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Ketua Divisi IT"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Perusahaan/Organisasi</label>
              <input type="text" required value={company} onChange={e => setCompany(e.target.value)}
                placeholder="Karang Taruna Cintamulya"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Tipe</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500">
                <option value="Organisasi">Organisasi</option>
                <option value="Freelance">Freelance</option>
                <option value="Magang">Magang</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Periode</label>
              <input type="text" required value={yearRange} onChange={e => setYearRange(e.target.value)}
                placeholder="2024 — Sekarang"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Deskripsi (opsional)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Logo Instansi (Bebas Landscape / Portrait / Persegi)</label>
              <div className="flex flex-wrap items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*"
                  onChange={e => handleSelectNewLogo(e.target.files?.[0] || null)}
                  className="hidden" 
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload" 
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm cursor-pointer transition-colors border border-zinc-700/50"
                >
                  <Upload size={16} /> Pilih File Logo
                </label>
                {logoPreview && (
                  <div className="flex items-center gap-2">
                    <div className="h-11 min-w-[44px] max-w-[96px] px-2 py-1 rounded-lg bg-white/95 border border-zinc-700 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="Preview" className="max-h-9 max-w-[80px] w-auto h-auto object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectNewLogo(null)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full sm:w-auto px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors text-sm disabled:opacity-50 cursor-pointer">
            {saving ? "Menyimpan..." : "Tambah"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Daftar Experience ({list.length})</h2>
        </div>

        <div className="divide-y divide-zinc-800/50">
          {loading ? (
            <div className="p-6 text-center text-zinc-500">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">Belum ada experience.</div>
          ) : (
            list.map((item, idx) => (
              <div key={item.id} className="p-4 md:p-5 hover:bg-zinc-800/10 transition-colors">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})}
                        placeholder="Posisi" className="bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                      <input value={editData.company} onChange={e => setEditData({...editData, company: e.target.value})}
                        placeholder="Perusahaan" className="bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select value={editData.type} onChange={e => setEditData({...editData, type: e.target.value})}
                        className="bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none">
                        <option value="Organisasi">Organisasi</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Magang">Magang</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                      </select>
                      <input value={editData.year_range} onChange={e => setEditData({...editData, year_range: e.target.value})}
                        placeholder="Periode" className="bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    </div>
                    <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})}
                      rows={2} className="w-full bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    
                    <div className="flex flex-wrap gap-3 items-center">
                      <input 
                        type="file" 
                        ref={editFileInputRef} 
                        accept="image/*"
                        onChange={e => handleSelectEditLogo(e.target.files?.[0] || null)}
                        className="hidden" 
                        id={`edit-logo-${item.id}`}
                      />
                      <label 
                        htmlFor={`edit-logo-${item.id}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs cursor-pointer transition-colors border border-zinc-700/50"
                      >
                        <Upload size={14} /> Pilih / Ganti Logo
                      </label>

                      {(editLogoPreview || editData.logo_url) && (
                        <div className="flex items-center gap-2">
                          <div className="h-11 min-w-[44px] max-w-[96px] px-2 py-1 rounded-lg bg-white/95 border border-zinc-700 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={editLogoPreview || editData.logo_url}
                              alt="Preview Logo"
                              className="max-h-9 max-w-[80px] w-auto h-auto object-contain"
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              setEditData({...editData, logo_url: ''});
                              setEditLogoFile(null);
                              setEditLogoPreview('');
                            }}
                            className="text-xs text-red-400 hover:underline cursor-pointer"
                          >
                            Hapus Logo
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(item.id)} disabled={saving} className="px-4 py-1.5 bg-emerald-500 text-black rounded-lg text-sm font-bold flex items-center gap-1 cursor-pointer"><Check size={14} /> {saving ? 'Menyimpan...' : 'Simpan'}</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm flex items-center gap-1 cursor-pointer"><X size={14} /> Batal</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Logo Preview in list (adaptif landscape/portrait/persegi) */}
                    {item.logo_url ? (
                      <div className="h-12 min-w-[48px] max-w-[96px] px-2 py-1 rounded-lg bg-white/95 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.logo_url}
                          alt={item.company}
                          className="max-h-10 max-w-[84px] w-auto h-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <ImageIcon className="text-zinc-600" size={18} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded font-mono">{item.type}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{item.company} · {item.year_range}</p>
                      {item.description && <p className="text-xs text-zinc-600 mt-1 line-clamp-1">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveItem(item.id, 'up')} disabled={idx === 0}
                        aria-label={`Pindah ${item.title} ke atas`}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-20 cursor-pointer" title="Move Up">
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveItem(item.id, 'down')} disabled={idx === list.length - 1}
                        aria-label={`Pindah ${item.title} ke bawah`}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-20 cursor-pointer" title="Move Down">
                        <ArrowDown size={14} />
                      </button>
                      <button onClick={() => startEdit(item)} className="p-2 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors cursor-pointer" title="Edit"
                        aria-label={`Edit ${item.title}`}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer" title="Delete"
                        aria-label={`Hapus ${item.title}`}>
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
