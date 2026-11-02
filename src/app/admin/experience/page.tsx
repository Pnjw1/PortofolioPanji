"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, Trash2, Plus, Pencil, X, Check, ArrowUp, ArrowDown, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/Toast';
import Image from 'next/image';

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
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);

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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      let logoUrl = null;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `experience_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, logoFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
        logoUrl = publicUrl;
      }

      const { error } = await supabase.from('portfolio_experiences').insert([{
        title, company, type, year_range: yearRange, description: description || null,
        sort_order: list.length, logo_url: logoUrl
      }]);

      if (error) throw error;

      setTitle(''); setCompany(''); setType('Organisasi'); setYearRange(''); setDescription('');
      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchData();
      toast('Experience ditambahkan!', 'success');
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

  function startEdit(item: any) {
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
  }

  async function saveEdit(id: number) {
    setSaving(true);
    try {
      let logoUrl = editData.logo_url;

      if (editLogoFile) {
        const fileExt = editLogoFile.name.split('.').pop();
        const fileName = `experience_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, editLogoFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
        logoUrl = publicUrl;
      }

      const { error } = await supabase.from('portfolio_experiences').update({
        title: editData.title, company: editData.company, type: editData.type,
        year_range: editData.year_range, description: editData.description || null,
        logo_url: logoUrl || null
      }).eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setEditLogoFile(null);
      fetchData();
      toast('Perubahan disimpan!', 'success');
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
        <p className="text-zinc-400 mt-1 text-sm">Kelola timeline pengalaman kerja & organisasi dengan logo.</p>
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
              <label className="block text-xs font-mono text-zinc-500 mb-1">Logo Instansi</label>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*"
                  onChange={e => setLogoFile(e.target.files?.[0] || null)}
                  className="hidden" 
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload" 
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm cursor-pointer transition-colors border border-zinc-700/50"
                >
                  <Upload size={16} /> Pilih File
                </label>
                {logoFile && (
                  <span className="text-xs text-cyan-400 font-mono truncate max-w-[200px]">
                    {logoFile.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full sm:w-auto px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors text-sm disabled:opacity-50">
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
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <div className="flex items-center gap-3">
                        <input 
                          type="file" 
                          ref={editFileInputRef} 
                          accept="image/*"
                          onChange={e => setEditLogoFile(e.target.files?.[0] || null)}
                          className="hidden" 
                          id={`edit-logo-${item.id}`}
                        />
                        <label 
                          htmlFor={`edit-logo-${item.id}`}
                          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs cursor-pointer transition-colors border border-zinc-700/50"
                        >
                          <Upload size={14} /> Ganti Logo
                        </label>
                        {editLogoFile && (
                          <span className="text-xs text-cyan-400 font-mono truncate max-w-[150px]">
                            {editLogoFile.name}
                          </span>
                        )}
                      </div>
                      {editData.logo_url && !editLogoFile && (
                        <button 
                          type="button" 
                          onClick={() => setEditData({...editData, logo_url: ''})}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Hapus Logo Saat Ini
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(item.id)} disabled={saving} className="px-4 py-1.5 bg-emerald-500 text-black rounded-lg text-sm font-bold flex items-center gap-1"><Check size={14} /> Simpan</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm flex items-center gap-1"><X size={14} /> Batal</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Logo Preview in list */}
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {item.logo_url ? (
                        <Image 
                          src={item.logo_url} 
                          alt={item.company} 
                          fill 
                          sizes="40px" 
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="text-zinc-600" size={18} />
                      )}
                    </div>

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
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-20" title="Move Up">
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveItem(item.id, 'down')} disabled={idx === list.length - 1}
                        aria-label={`Pindah ${item.title} ke bawah`}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-20" title="Move Down">
                        <ArrowDown size={14} />
                      </button>
                      <button onClick={() => startEdit(item)} className="p-2 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors" title="Edit"
                        aria-label={`Edit ${item.title}`}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete"
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
