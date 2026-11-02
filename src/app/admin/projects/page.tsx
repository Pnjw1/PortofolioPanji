"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, Trash2, Plus, Pencil, X, Check, ExternalLink, Image as ImageIcon, Upload } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function ProjectsManager() {
  const [projectList, setProjectList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();

  // Gallery state
  const [galleryProject, setGalleryProject] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryAltText, setGalleryAltText] = useState('');
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techString, setTechString] = useState('');
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [projectType, setProjectType] = useState<'link' | 'detail'>('link');
  const [slug, setSlug] = useState('');
  const [altText, setAltText] = useState('');

  const randomGradients = [
    { bg: 'from-cyan-500/10 to-transparent', border: 'hover:border-cyan-500/50' },
    { bg: 'from-purple-500/10 to-transparent', border: 'hover:border-purple-500/50' },
    { bg: 'from-green-500/10 to-transparent', border: 'hover:border-green-500/50' },
    { bg: 'from-blue-500/10 to-transparent', border: 'hover:border-blue-500/50' },
    { bg: 'from-emerald-500/10 to-transparent', border: 'hover:border-emerald-500/50' },
    { bg: 'from-amber-500/10 to-transparent', border: 'hover:border-amber-500/50' },
    { bg: 'from-pink-500/10 to-transparent', border: 'hover:border-pink-500/50' },
  ];

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data } = await supabase.from('portfolio_projects').select('*').order('created_at', { ascending: false });
    if (data) setProjectList(data);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const techArray = techString.split(',').map(t => t.trim()).filter(t => t !== '');
    const autoStyle = randomGradients[Math.floor(Math.random() * randomGradients.length)];

    let finalImageUrl = null;
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, imageFile);
      if (uploadError) { toast('Gagal upload: ' + uploadError.message, 'error'); setSaving(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
      finalImageUrl = publicUrl;
    }

    const insertData: any = {
      title, description, tech_array: techArray, link: link || null, image_url: finalImageUrl,
      icon_name: 'FolderGit2', col_span: 'md:col-span-1 lg:col-span-1', gradient_class: autoStyle.bg,
      hover_border_class: autoStyle.border, is_featured: true,
      type: projectType, alt_text: altText || null,
    };

    let finalSlug = slug;
    if (projectType === 'detail') {
      finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      insertData.slug = finalSlug;
    }

    const { data: insertedProject, error } = await supabase.from('portfolio_projects').insert([insertData]).select().single();
    if (!error) {
      // Upload gallery if it's detail and has files
      if (projectType === 'detail' && galleryFiles.length > 0 && finalSlug) {
        for (let i = 0; i < galleryFiles.length; i++) {
          const file = galleryFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `gallery_${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, file);
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
            await supabase.from('project_images').insert([{
              project_slug: finalSlug,
              image_url: publicUrl,
              sort_order: i
            }]);
          }
        }
      }

      setTitle(''); setDescription(''); setTechString(''); setLink(''); setAltText('');
      setImageFile(null); setGalleryFiles([]); setProjectType('link'); setSlug('');
      const el1 = document.getElementById('image-upload') as HTMLInputElement;
      if (el1) el1.value = '';
      const el2 = document.getElementById('gallery-multi-upload') as HTMLInputElement;
      if (el2) el2.value = '';
      
      fetchProjects();
      toast('Project berhasil ditambahkan!', 'success');
    } else { toast('Gagal: ' + error.message, 'error'); }
    setSaving(false);
  }

  async function handleDelete(id: number, projectSlug?: string) {
    if (!confirm("Hapus project ini?")) return;
    // Delete gallery images if detail type
    if (projectSlug) {
      await supabase.from('project_images').delete().eq('project_slug', projectSlug);
    }
    const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
    if (!error) { fetchProjects(); toast('Project berhasil dihapus.', 'success'); }
    else toast('Gagal: ' + error.message, 'error');
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setEditData({
      title: item.title, description: item.description,
      tech_array: item.tech_array?.join(', ') || '', link: item.link || '',
      alt_text: item.alt_text || ''
    });
  }

  async function saveEdit(id: number) {
    const techArray = editData.tech_array.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
    const { error } = await supabase.from('portfolio_projects').update({
      title: editData.title, description: editData.description,
      tech_array: techArray, link: editData.link || null,
      alt_text: editData.alt_text || null
    }).eq('id', id);
    if (!error) { setEditingId(null); fetchProjects(); toast('Perubahan disimpan!', 'success'); }
    else toast('Gagal: ' + error.message, 'error');
  }

  // Gallery management
  async function openGallery(project: any) {
    setGalleryProject(project);
    const { data } = await supabase.from('project_images').select('*').eq('project_slug', project.slug).order('sort_order', { ascending: true });
    setGalleryImages(data || []);
  }

  async function uploadGalleryImage(e: React.FormEvent) {
    e.preventDefault();
    if (!galleryFile || !galleryProject) return;
    setUploadingGallery(true);

    const fileExt = galleryFile.name.split('.').pop();
    const fileName = `gallery_${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, galleryFile);
    if (uploadError) { toast('Upload gagal: ' + uploadError.message, 'error'); setUploadingGallery(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);

    const { error } = await supabase.from('project_images').insert([{
      project_slug: galleryProject.slug,
      image_url: publicUrl,
      caption: galleryCaption || null,
      alt_text: galleryAltText || null,
      sort_order: galleryImages.length,
    }]);

    if (!error) {
      toast('Screenshot ditambahkan!', 'success');
      setGalleryCaption('');
      setGalleryAltText('');
      setGalleryFile(null);
      const el = document.getElementById('gallery-upload') as HTMLInputElement;
      if (el) el.value = '';
      openGallery(galleryProject); // refresh
    } else { toast('Gagal: ' + error.message, 'error'); }
    setUploadingGallery(false);
  }

  async function deleteGalleryImage(id: number) {
    if (!confirm("Hapus screenshot ini?")) return;
    const { error } = await supabase.from('project_images').delete().eq('id', id);
    if (!error) { toast('Screenshot dihapus.', 'success'); openGallery(galleryProject); }
    else toast('Gagal: ' + error.message, 'error');
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Briefcase className="text-purple-500" />
          Manage Projects
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">Kelola project: langsung ke link atau buka halaman detail showcase.</p>
      </div>

      {/* ADD FORM */}
      <div className="bg-[#121212] border border-zinc-800 p-4 md:p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus size={18} className="text-purple-400" /> Tambah Project
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          {/* Type Select */}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setProjectType('link')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                projectType === 'link' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}>
              <ExternalLink size={14} /> Link Langsung
            </button>
            <button type="button" onClick={() => setProjectType('detail')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                projectType === 'detail' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}>
              <ImageIcon size={14} /> Halaman Detail
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Tech Stack (comma separated)</label>
              <input type="text" required value={techString} onChange={e => setTechString(e.target.value)}
                placeholder="Next.js, Tailwind, Supabase"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1">Description</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">{projectType === 'detail' ? 'Live Preview URL (opsional)' : 'Project Link'}</label>
              <input type="text" value={link} onChange={e => setLink(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-1">Cover Image (opsional)</label>
              <input id="image-upload" type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-500 file:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1">Alt Text untuk SEO Gambar (opsional)</label>
            <input type="text" value={altText} onChange={e => setAltText(e.target.value)}
              placeholder="Contoh: Tampilan aplikasi portal berita XYZ"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500" />
          </div>

          {/* Slug & Multiple Screenshots for detail type */}
          {projectType === 'detail' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1">Slug (URL)</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="otomatis dari title"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
                <p className="text-xs text-zinc-600 mt-1">/projects/{slug || 'auto-generated'}</p>
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1">Screenshots (bisa pilih banyak)</label>
                <input id="gallery-multi-upload" type="file" accept="image/*" multiple onChange={e => setGalleryFiles(Array.from(e.target.files || []))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-black" />
                <p className="text-xs text-zinc-600 mt-1">{galleryFiles.length} file terpilih</p>
              </div>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full sm:w-auto px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg transition-colors text-sm">
            {saving ? "Uploading..." : "Tambah Project"}
          </button>
        </form>
      </div>

      {/* Gallery Manager Modal */}
      {galleryProject && (
        <div className="bg-[#121212] border border-cyan-500/30 p-4 md:p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon size={18} className="text-cyan-400" />
              Gallery: {galleryProject.title}
            </h2>
            <button onClick={() => setGalleryProject(null)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"><X size={18} /></button>
          </div>

          {/* Upload new screenshot */}
          <form onSubmit={uploadGalleryImage} className="flex flex-col sm:flex-row gap-3">
            <input id="gallery-upload" type="file" accept="image/*" required onChange={e => setGalleryFile(e.target.files?.[0] || null)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-black" />
            <input type="text" value={galleryCaption} onChange={e => setGalleryCaption(e.target.value)} placeholder="Caption (opsional)"
              className="sm:w-32 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none" />
            <input type="text" value={galleryAltText} onChange={e => setGalleryAltText(e.target.value)} placeholder="Alt Text (SEO)"
              className="sm:w-32 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none" />
            <button type="submit" disabled={uploadingGallery}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-sm flex items-center gap-1 shrink-0">
              <Upload size={14} /> {uploadingGallery ? "..." : "Upload"}
            </button>
          </form>

          {/* Existing gallery images */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryImages.map(img => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                <img src={img.image_url} alt={img.caption || ''} className="w-full aspect-video object-cover" />
                {img.caption && <p className="p-2 text-xs text-zinc-400 truncate">{img.caption}</p>}
                <button onClick={() => deleteGalleryImage(img.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {galleryImages.length === 0 && <p className="col-span-full text-zinc-500 text-sm py-4">Belum ada screenshot.</p>}
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Daftar Project ({projectList.length})</h2>
        </div>

        <div className="divide-y divide-zinc-800/50">
          {loading ? (
            <div className="p-6 text-center text-zinc-500">Loading...</div>
          ) : projectList.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">Belum ada project.</div>
          ) : (
            projectList.map((item) => (
              <div key={item.id} className="p-4 md:p-5 hover:bg-zinc-800/10 transition-colors">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})}
                        className="bg-zinc-900 border border-purple-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                      <input value={editData.tech_array} onChange={e => setEditData({...editData, tech_array: e.target.value})}
                        placeholder="Tech" className="bg-zinc-900 border border-purple-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    </div>
                    <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})}
                      rows={2} className="w-full bg-zinc-900 border border-purple-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                    <input value={editData.link} onChange={e => setEditData({...editData, link: e.target.value})}
                      placeholder="Link" className="w-full bg-zinc-900 border border-purple-500/50 rounded-lg px-3 py-2 text-white text-sm outline-none" />
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
                        {item.type === 'detail' ? (
                          <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded font-mono">DETAIL</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded font-mono">LINK</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tech_array?.map((t: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded font-mono">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.type === 'detail' && item.slug && (
                        <button onClick={() => openGallery(item)} className="p-2 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors" title="Kelola Gallery">
                          <ImageIcon size={16} />
                        </button>
                      )}
                      <button onClick={() => startEdit(item)} className="p-2 text-zinc-500 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors" title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id, item.slug)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
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
