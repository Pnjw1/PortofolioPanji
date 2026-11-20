"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, Trash2, Plus, Pencil, X, Check, ExternalLink, Image as ImageIcon, Upload } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { buildCaseStudy, getProjectSlug, serializeCaseStudyToDescription } from '@/lib/project-case-studies';

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

  // Form states (Tambah Project Baru + Studi Kasus)
  const [title, setTitle] = useState('');
  const [oneLineResult, setOneLineResult] = useState('');
  const [problem, setProblem] = useState('');
  const [role, setRole] = useState('Web Developer & Desainer Komunikasi Visual');
  const [resultsText, setResultsText] = useState('');
  const [techString, setTechString] = useState('');
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [projectType, setProjectType] = useState<'link' | 'detail'>('detail');
  const [slug, setSlug] = useState('');
  const [altText, setAltText] = useState('');

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

    let finalImageUrl = null;
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `project_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, imageFile);
      if (uploadError) {
        toast('Gagal upload gambar: ' + uploadError.message, 'error');
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
      finalImageUrl = publicUrl;
    }

    const serializedDescription = serializeCaseStudyToDescription({
      oneLineResult: oneLineResult || title,
      problem: problem || oneLineResult,
      role: role || 'Web Developer & Desainer Komunikasi Visual',
      resultsText: resultsText || oneLineResult,
    });

    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const insertData: any = {
      title,
      description: serializedDescription,
      tech_array: techArray,
      link: link || null,
      image_url: finalImageUrl,
      icon_name: 'FolderGit2',
      col_span: 'md:col-span-1 lg:col-span-1',
      gradient_class: 'from-cyan-500/10 to-transparent',
      hover_border_class: 'hover:border-cyan-500/50',
      is_featured: true,
      type: projectType,
      slug: finalSlug,
      alt_text: altText || null,
    };

    const { error } = await supabase.from('portfolio_projects').insert([insertData]);
    if (!error) {
      if (galleryFiles.length > 0 && finalSlug) {
        for (let i = 0; i < galleryFiles.length; i++) {
          const file = galleryFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `gallery_${Date.now()}_${i}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(fileName, file);
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(fileName);
            await supabase.from('project_images').insert([{
              project_slug: finalSlug,
              image_url: publicUrl,
              sort_order: i,
            }]);
          }
        }
      }

      setTitle('');
      setOneLineResult('');
      setProblem('');
      setRole('Web Developer & Desainer Komunikasi Visual');
      setResultsText('');
      setTechString('');
      setLink('');
      setAltText('');
      setImageFile(null);
      setGalleryFiles([]);
      setProjectType('detail');
      setSlug('');
      const el1 = document.getElementById('image-upload') as HTMLInputElement;
      if (el1) el1.value = '';
      const el2 = document.getElementById('gallery-multi-upload') as HTMLInputElement;
      if (el2) el2.value = '';
      
      fetchProjects();
      toast('Proyek & Studi Kasus berhasil ditambahkan!', 'success');
    } else {
      toast('Gagal: ' + error.message, 'error');
    }
    setSaving(false);
  }

  async function handleDelete(id: number, projectSlug?: string) {
    if (!confirm("Hapus project ini?")) return;
    if (projectSlug) {
      await supabase.from('project_images').delete().eq('project_slug', projectSlug);
    }
    const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
    if (!error) { fetchProjects(); toast('Project berhasil dihapus.', 'success'); }
    else toast('Gagal: ' + error.message, 'error');
  }

  function startEdit(item: any) {
    const cs = buildCaseStudy(item);
    setEditingId(item.id);
    setEditData({
      title: item.title,
      slug: item.slug || getProjectSlug(item),
      oneLineResult: cs.oneLineResult,
      problem: cs.problem,
      role: cs.role,
      resultsText: cs.results.join('\n'),
      tech_array: item.tech_array?.join(', ') || '',
      link: item.link || '',
      alt_text: item.alt_text || '',
      image_url: item.image_url || '',
      newImageFile: null as File | null,
    });
  }

  async function saveEdit(id: number) {
    setSaving(true);
    let finalImageUrl = editData.image_url || null;

    if (editData.newImageFile) {
      const file = editData.newImageFile as File;
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `project_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio_images')
        .upload(fileName, file);
      if (uploadError) {
        toast('Upload thumbnail gagal: ' + uploadError.message, 'error');
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio_images')
        .getPublicUrl(fileName);
      finalImageUrl = publicUrl;
    }

    const techArray = editData.tech_array.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
    const serializedDescription = serializeCaseStudyToDescription({
      oneLineResult: editData.oneLineResult || editData.title,
      problem: editData.problem || editData.oneLineResult,
      role: editData.role || 'Web Developer & Desainer Komunikasi Visual',
      resultsText: editData.resultsText || editData.oneLineResult,
    });

    const { error } = await supabase.from('portfolio_projects').update({
      title: editData.title,
      slug: editData.slug || null,
      description: serializedDescription,
      tech_array: techArray,
      link: editData.link || null,
      alt_text: editData.alt_text || null,
      image_url: finalImageUrl,
    }).eq('id', id);

    setSaving(false);
    if (!error) {
      setEditingId(null);
      fetchProjects();
      toast('Studi Kasus & Proyek berhasil disimpan!', 'success');
    } else {
      toast('Gagal: ' + error.message, 'error');
    }
  }

  // Gallery management
  async function openGallery(project: any) {
    const pSlug = project.slug || getProjectSlug(project);
    setGalleryProject({ ...project, slug: pSlug });
    const { data } = await supabase.from('project_images').select('*').eq('project_slug', pSlug).order('sort_order', { ascending: true });
    setGalleryImages(data || []);
  }

  async function uploadGalleryImage(e: React.FormEvent) {
    e.preventDefault();
    if (!galleryFile || !galleryProject) return;
    setUploadingGallery(true);

    const fileExt = galleryFile.name.split('.').pop();
    const fileName = `gallery_${Date.now()}.${fileExt}`;
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
      openGallery(galleryProject);
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
          <Briefcase className="text-cyan-400" />
          Manage Projects &amp; Studi Kasus
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Kelola kartu proyek dan 4 bagian Studi Kasus (Ringkasan, Masalah, Peran, Teknologi, &amp; Hasil) langsung dari sini.
        </p>
      </div>

      {/* ADD FORM */}
      <div className="bg-[#121212] border border-zinc-800 p-4 md:p-6 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus size={18} className="text-cyan-400" /> Tambah Proyek &amp; Studi Kasus Baru
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Judul Proyek</label>
              <input type="text" required value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                }}
                placeholder="Sistem Informasi Karang Taruna"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">3. Teknologi yang Digunakan (pisah koma)</label>
              <input type="text" required value={techString} onChange={e => setTechString(e.target.value)}
                placeholder="Next.js, Tailwind CSS, Supabase"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cyan-400 mb-1">
              Ringkasan 1 Kalimat Hasil (Tampil di kartu beranda &amp; subjudul studi kasus)
            </label>
            <input type="text" required value={oneLineResult} onChange={e => setOneLineResult(e.target.value)}
              placeholder="Pusat informasi dan pengelolaan data kegiatan Karang Taruna Desa Cintamulya di kartacintamulya.org."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">1. Masalah &amp; Latar Belakang</label>
              <textarea required value={problem} onChange={e => setProblem(e.target.value)} rows={3}
                placeholder="Jelaskan masalah yang ingin diselesaikan oleh proyek ini..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">2. Peran Saya</label>
              <textarea required value={role} onChange={e => setRole(e.target.value)} rows={3}
                placeholder="Fullstack Web Developer & Desainer Komunikasi Visual — merancang UI/UX, database, hingga deployment..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">
              4. Hasil &amp; Dampak (Tulis 1 poin per baris — pisahkan dengan Enter)
            </label>
            <textarea required value={resultsText} onChange={e => setResultsText(e.target.value)} rows={3}
              placeholder={"Situs resmi berjalan aktif di kartacintamulya.org\nPengurus dapat mengelola konten secara mandiri lewat dashboard CMS\nMelayani 45+ pengurus dan warga desa"}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Slug URL Studi Kasus</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="otomatis-dari-judul"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">URL Situs Live (opsional)</label>
              <input type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="https://kartacintamulya.org"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Alt Text Gambar (SEO)</label>
              <input type="text" value={altText} onChange={e => setAltText(e.target.value)}
                placeholder="Tampilan beranda Sistem Informasi Karang Taruna"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Thumbnail Utama (16:9)</label>
              <input id="image-upload" type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-black" />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Tangkapan Layar Tambahan (bisa pilih banyak)</label>
              <input id="gallery-multi-upload" type="file" accept="image/*" multiple onChange={e => setGalleryFiles(Array.from(e.target.files || []))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-700 file:text-white" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors text-sm cursor-pointer">
            {saving ? "Menyimpan..." : "Tambah Proyek & Studi Kasus"}
          </button>
        </form>
      </div>

      {/* Gallery Manager Modal */}
      {galleryProject && (
        <div className="bg-[#121212] border border-cyan-500/30 p-4 md:p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon size={18} className="text-cyan-400" />
              Galeri Screenshot: {galleryProject.title}
            </h2>
            <button onClick={() => setGalleryProject(null)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"><X size={18} /></button>
          </div>

          <form onSubmit={uploadGalleryImage} className="flex flex-col sm:flex-row gap-3">
            <input id="gallery-upload" type="file" accept="image/*" required onChange={e => setGalleryFile(e.target.files?.[0] || null)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-black" />
            <input type="text" value={galleryCaption} onChange={e => setGalleryCaption(e.target.value)} placeholder="Caption (opsional)"
              className="sm:w-36 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none" />
            <input type="text" value={galleryAltText} onChange={e => setGalleryAltText(e.target.value)} placeholder="Alt Text (SEO)"
              className="sm:w-36 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm outline-none" />
            <button type="submit" disabled={uploadingGallery}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-sm flex items-center gap-1 shrink-0 cursor-pointer">
              <Upload size={14} /> {uploadingGallery ? "..." : "Upload"}
            </button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryImages.map(img => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt={img.caption || ''} className="w-full aspect-video object-cover" />
                {img.caption && <p className="p-2 text-xs text-zinc-400 truncate">{img.caption}</p>}
                <button onClick={() => deleteGalleryImage(img.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {galleryImages.length === 0 && <p className="col-span-full text-zinc-500 text-sm py-4">Belum ada screenshot tambahan.</p>}
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Daftar Proyek ({projectList.length}) — Klik Ikon Pensil untuk Edit Studi Kasus</h2>
        </div>

        <div className="divide-y divide-zinc-800/50">
          {loading ? (
            <div className="p-6 text-center text-zinc-500">Loading...</div>
          ) : projectList.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">Belum ada project.</div>
          ) : (
            projectList.map((item) => {
              const cs = buildCaseStudy(item);
              const itemSlug = getProjectSlug(item);
              return (
                <div key={item.id} className="p-4 md:p-5 hover:bg-zinc-800/10 transition-colors">
                  {editingId === item.id ? (
                    <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-cyan-500/30">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono text-zinc-400 mb-1">Judul Proyek</label>
                          <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-zinc-400 mb-1">3. Teknologi (pisah koma)</label>
                          <input value={editData.tech_array} onChange={e => setEditData({...editData, tech_array: e.target.value})}
                            placeholder="Next.js, Tailwind CSS, Supabase" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-cyan-400 mb-1">Ringkasan 1 Kalimat Hasil (Tampil di kartu beranda)</label>
                        <input value={editData.oneLineResult} onChange={e => setEditData({...editData, oneLineResult: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono text-zinc-400 mb-1">1. Masalah &amp; Latar Belakang</label>
                          <textarea value={editData.problem} onChange={e => setEditData({...editData, problem: e.target.value})}
                            rows={4} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-zinc-400 mb-1">2. Peran Saya</label>
                          <textarea value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})}
                            rows={4} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">4. Hasil &amp; Dampak (1 baris = 1 poin bullet)</label>
                        <textarea value={editData.resultsText} onChange={e => setEditData({...editData, resultsText: e.target.value})}
                          rows={4} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-mono text-zinc-400 mb-1">Slug URL</label>
                          <input value={editData.slug} onChange={e => setEditData({...editData, slug: e.target.value})}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none font-mono focus:border-cyan-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-zinc-400 mb-1">URL Situs Live</label>
                          <input value={editData.link} onChange={e => setEditData({...editData, link: e.target.value})}
                            placeholder="https://..." className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-zinc-400 mb-1">Alt Text Gambar</label>
                          <input value={editData.alt_text} onChange={e => setEditData({...editData, alt_text: e.target.value})}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500" />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-2">
                        <label className="block text-xs font-mono text-cyan-400">
                          Thumbnail Preview Kartu (Tampil di Beranda)
                        </label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          {editData.image_url && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={editData.image_url}
                              alt="Thumbnail saat ini"
                              className="w-28 aspect-video object-cover rounded-md border border-zinc-700 shrink-0"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                newImageFile: e.target.files?.[0] || null,
                              })
                            }
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-white text-xs sm:text-sm file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-cyan-500 file:text-black file:font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button onClick={() => saveEdit(item.id)} disabled={saving} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-sm font-bold flex items-center gap-1 cursor-pointer">
                          <Check size={14} /> {saving ? 'Menyimpan...' : 'Simpan Studi Kasus'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm flex items-center gap-1 cursor-pointer">
                          <X size={14} /> Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white truncate">{item.title}</h3>
                          <a
                            href={`/projects/${encodeURIComponent(itemSlug)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded font-mono hover:bg-cyan-500/20"
                          >
                            /projects/{itemSlug} ↗
                          </a>
                          {cs.hasPlaceholders && (
                            <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-mono">
                              Perlu Isi Angka [ISI: ...]
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{cs.oneLineResult}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tech_array?.map((t: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded font-mono">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openGallery(item)} className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors cursor-pointer" title="Kelola Galeri Screenshot">
                          <ImageIcon size={16} />
                        </button>
                        <button onClick={() => startEdit(item)} className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors cursor-pointer" title="Edit Studi Kasus & Proyek">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.slug)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer" title="Hapus">
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
