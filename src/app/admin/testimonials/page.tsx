"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquareQuote, Trash2, Plus, Pencil, X, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function TestimonialsManager() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase.from('portfolio_testimonials').select('*').order('created_at', { ascending: false });
    if (data) setList(data);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let avatarUrl = null;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `avatar_${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, avatarFile);
      if (uploadError) { toast('Upload gagal: ' + uploadError.message, 'error'); setSaving(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
      avatarUrl = publicUrl;
    }

    const { error } = await supabase.from('portfolio_testimonials').insert([{
      name, role, message, avatar_url: avatarUrl,
    }]);
    if (!error) {
      setName(''); setRole(''); setMessage(''); setAvatarFile(null);
      const el = document.getElementById('avatar-upload') as HTMLInputElement;
      if (el) el.value = '';
      fetchData();
      toast('Testimoni ditambahkan!', 'success');
    } else { toast('Gagal: ' + error.message, 'error'); }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus testimoni ini?")) return;
    const { error } = await supabase.from('portfolio_testimonials').delete().eq('id', id);
    if (!error) { fetchData(); toast('Testimoni dihapus.', 'success'); }
    else toast('Gagal: ' + error.message, 'error');
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setEditData({ name: item.name, role: item.role, message: item.message });
  }

  async function saveEdit(id: number) {
    const { error } = await supabase.from('portfolio_testimonials').update({
      name: editData.name, role: editData.role, message: editData.message,
    }).eq('id', id);
    if (!error) { setEditingId(null); fetchData(); toast('Perubahan disimpan!', 'success'); }
    else toast('Gagal: ' + error.message, 'error');
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <MessageSquareQuote className="text-pink-500" />
          Manage Testimonials
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">Kelola testimoni dari klien, teman, atau guru.</p>
      </div>

      {/* ADD FORM */}
      <div className="bg-[#121212] border border-zinc-800 p-4 md:p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus size={18} className="text-pink-400" /> Tambah Testimoni
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Nama</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pink-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Role/Jabatan</label>
              <input type="text" required value={role} onChange={e => setRole(e.target.value)}
                placeholder="Guru RPL, Ketua Karang Taruna, dll"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pink-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1">Pesan Testimoni</label>
            <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={3}
              placeholder="Panji orangnya hardworking, cepat belajar, dan selalu menghasilkan karya yang berkualitas..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1">Foto (opsional)</label>
            <input id="avatar-upload" type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-500 file:text-white" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full sm:w-auto px-6 py-2 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-lg transition-colors text-sm">
            {saving ? "..." : "Tambah Testimoni"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Daftar Testimoni ({list.length})</h2>
        </div>

        <div className="divide-y divide-zinc-800/50">
          {loading ? (
            <div className="p-6 text-center text-zinc-500">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">Belum ada testimoni.</div>
          ) : (
            list.map((item) => (
              <div key={item.id} className="p-4 md:p-5 hover:bg-zinc-800/10 transition-colors">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})}
                        placeholder="Nama" className="bg-zinc-900 border border-pink-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                      <input value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})}
                        placeholder="Role" className="bg-zinc-900 border border-pink-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    </div>
                    <textarea value={editData.message} onChange={e => setEditData({...editData, message: e.target.value})}
                      rows={3} className="w-full bg-zinc-900 border border-pink-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(item.id)} className="px-4 py-1.5 bg-emerald-500 text-black rounded-lg text-sm font-bold flex items-center gap-1"><Check size={14} /> Simpan</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm flex items-center gap-1"><X size={14} /> Batal</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex items-center gap-3 shrink-0">
                      {item.avatar_url ? (
                        <img src={item.avatar_url} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-zinc-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <span className="text-xs text-zinc-500">· {item.role}</span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1 line-clamp-2 italic">&ldquo;{item.message}&rdquo;</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => startEdit(item)} className="p-2 text-zinc-500 hover:text-pink-400 hover:bg-pink-400/10 rounded-lg transition-colors" title="Edit">
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
