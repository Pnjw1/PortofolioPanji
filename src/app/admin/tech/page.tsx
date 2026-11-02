"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { TerminalSquare, Trash2, Plus, Pencil, X, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/Toast';
import Image from 'next/image';

export default function TechManager() {
  const [techList, setTechList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('Layout');
  const [category, setCategory] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const randomColors = [
    'text-cyan-400', 'text-sky-400', 'text-blue-500', 
    'text-emerald-500', 'text-green-400', 'text-lime-400',
    'text-purple-500', 'text-fuchsia-400', 'text-pink-500',
    'text-yellow-400', 'text-orange-400', 'text-red-400',
    'text-zinc-100'
  ];

  useEffect(() => { fetchTech(); }, []);

  async function fetchTech() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('portfolio_tech').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setTechList(data);
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
        const fileName = `tech_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, logoFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
        logoUrl = publicUrl;
      }

      const autoColor = randomColors[Math.floor(Math.random() * randomColors.length)];
      const { error } = await supabase.from('portfolio_tech').insert([
        { name, icon_name: iconName, category, color_class: autoColor, logo_url: logoUrl }
      ]);
      
      if (error) throw error;

      setName(''); setIconName('Layout'); setCategory('');
      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchTech();
      toast('Tech berhasil ditambahkan!', 'success');
    } catch (err: any) {
      toast('Gagal: ' + err.message, 'error');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus item ini?")) return;
    try {
      const { error } = await supabase.from('portfolio_tech').delete().eq('id', id);
      if (error) throw error;
      fetchTech();
      toast('Tech berhasil dihapus.', 'success');
    } catch (err: any) {
      toast('Gagal menghapus: ' + err.message, 'error');
    }
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setEditData({ 
      name: item.name, 
      icon_name: item.icon_name, 
      category: item.category,
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
        const fileName = `tech_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, editLogoFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
        logoUrl = publicUrl;
      }

      const { error } = await supabase.from('portfolio_tech').update({
        name: editData.name,
        icon_name: editData.icon_name,
        category: editData.category,
        logo_url: logoUrl || null
      }).eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setEditLogoFile(null);
      fetchTech();
      toast('Perubahan berhasil disimpan!', 'success');
    } catch (err: any) {
      toast('Gagal menyimpan: ' + err.message, 'error');
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <TerminalSquare className="text-cyan-500" />
          Manage Tech Stack
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">Kelola teknologi yang ditampilkan di marquee.</p>
      </div>

      {/* ADD FORM */}
      <div className="bg-[#121212] border border-zinc-800 p-4 md:p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus size={18} className="text-cyan-400" /> Tambah Tech
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Next.js"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Category</label>
              <input type="text" required value={category} onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Frontend"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Icon (Lucide Fallback)</label>
              <input type="text" required value={iconName} onChange={e => setIconName(e.target.value)}
                placeholder="e.g. Layout"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Logo File (SVG/Image)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*"
                  onChange={e => setLogoFile(e.target.files?.[0] || null)}
                  className="hidden" 
                  id="tech-logo-upload"
                />
                <label 
                  htmlFor="tech-logo-upload" 
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm cursor-pointer transition-colors border border-zinc-700/50 w-full justify-center"
                >
                  <Upload size={16} /> Pilih Logo
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            {logoFile && (
              <span className="text-xs text-cyan-400 font-mono truncate max-w-md">
                Selected logo: {logoFile.name}
              </span>
            )}
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors text-sm ml-auto disabled:opacity-50">
              {saving ? "Menyimpan..." : "Tambah"}
            </button>
          </div>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Daftar Tech ({techList.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400 min-w-[600px]">
            <thead className="bg-zinc-900/50 text-xs uppercase font-mono text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-4 md:px-6 py-3">Logo</th>
                <th className="px-4 md:px-6 py-3">Name</th>
                <th className="px-4 md:px-6 py-3">Category</th>
                <th className="px-4 md:px-6 py-3">Fallback Icon</th>
                <th className="px-4 md:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center text-zinc-500">Loading...</td></tr>
              ) : techList.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-zinc-500">Belum ada data.</td></tr>
              ) : (
                techList.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    {editingId === item.id ? (
                      <>
                        <td className="px-4 md:px-6 py-3">
                          <div className="flex flex-col gap-2">
                            <input 
                              type="file" 
                              ref={editFileInputRef} 
                              accept="image/*"
                              onChange={e => setEditLogoFile(e.target.files?.[0] || null)}
                              className="hidden" 
                              id={`edit-tech-logo-${item.id}`}
                            />
                            <label 
                              htmlFor={`edit-tech-logo-${item.id}`}
                              className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs cursor-pointer border border-zinc-700/50 justify-center"
                            >
                              <Upload size={12} /> Ganti
                            </label>
                            {editLogoFile && (
                              <span className="text-[10px] text-cyan-400 font-mono truncate max-w-[100px]">
                                {editLogoFile.name}
                              </span>
                            )}
                            {editData.logo_url && !editLogoFile && (
                              <button 
                                type="button" 
                                onClick={() => setEditData({...editData, logo_url: ''})}
                                className="text-[10px] text-red-400 hover:underline text-center"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3">
                          <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})}
                            className="bg-zinc-900 border border-cyan-500/50 rounded px-2 py-1 text-white text-sm w-full outline-none" />
                        </td>
                        <td className="px-4 md:px-6 py-3">
                          <input value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})}
                            className="bg-zinc-900 border border-cyan-500/50 rounded px-2 py-1 text-white text-sm w-full outline-none" />
                        </td>
                        <td className="px-4 md:px-6 py-3">
                          <input value={editData.icon_name} onChange={e => setEditData({...editData, icon_name: e.target.value})}
                            className="bg-zinc-900 border border-cyan-500/50 rounded px-2 py-1 text-white text-sm w-full outline-none" />
                        </td>
                        <td className="px-4 md:px-6 py-3 text-right flex gap-1 justify-end">
                          <button onClick={() => saveEdit(item.id)} disabled={saving} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg" title="Save">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-zinc-400 hover:bg-zinc-700 rounded-lg" title="Cancel">
                            <X size={16} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 md:px-6 py-3">
                          <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden relative">
                            {item.logo_url ? (
                              <Image 
                                src={item.logo_url} 
                                alt={item.name} 
                                fill 
                                sizes="32px" 
                                className="object-contain p-1"
                              />
                            ) : (
                              <ImageIcon className="text-zinc-700" size={14} />
                            )}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 font-medium text-white">{item.name}</td>
                        <td className="px-4 md:px-6 py-3">{item.category}</td>
                        <td className="px-4 md:px-6 py-3 font-mono text-xs">
                          <span className={`inline-block mr-2 ${item.color_class}`}>●</span>
                          {item.icon_name}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => startEdit(item)} className="p-2 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors" title="Edit">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
