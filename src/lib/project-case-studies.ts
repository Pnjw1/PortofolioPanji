export interface ProjectRecord {
  id: number;
  title: string;
  description: string;
  type?: 'detail' | 'external' | 'link' | string;
  slug?: string | null;
  link?: string | null;
  image_url?: string | null;
  alt_text?: string | null;
  icon_name?: string | null;
  tech_array?: string[] | null;
  gradient_class?: string | null;
  hover_border_class?: string | null;
  created_at?: string;
}

export interface CaseStudySections {
  oneLineResult: string;
  problem: string;
  role: string;
  technologies: string[];
  results: string[];
  hasPlaceholders: boolean;
}

export function slugifyTitle(title: string): string {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getProjectSlug(project: Pick<ProjectRecord, 'slug' | 'title' | 'id'>): string {
  if (project.slug && project.slug.trim() !== '') {
    return project.slug.trim();
  }
  const fromTitle = slugifyTitle(project.title);
  return fromTitle || `project-${project.id}`;
}

export function isKartaProject(project: Pick<ProjectRecord, 'title' | 'link' | 'slug'>): boolean {
  const t = (project.title || '').toLowerCase();
  const l = (project.link || '').toLowerCase();
  const s = (project.slug || '').toLowerCase();
  return (
    t.includes('karang taruna') ||
    t.includes('karta') ||
    l.includes('kartacintamulya') ||
    s.includes('karang-taruna') ||
    s.includes('karta')
  );
}

export function buildCaseStudy(project: ProjectRecord): CaseStudySections {
  const techs =
    project.tech_array && project.tech_array.length > 0
      ? project.tech_array
      : ['Next.js', 'Tailwind CSS', 'Supabase'];

  // Draf Studi Kasus resmi untuk Sistem Informasi Karang Taruna (kartacintamulya.org)
  // Berdasarkan fakta situs & CV pemilik, dengan placeholder eksplisit [ISI: angka] sesuai aturan kerja.
  if (isKartaProject(project)) {
    return {
      oneLineResult:
        'Pusat informasi dan pengelolaan data kegiatan Karang Taruna Desa Cintamulya yang terintegrasi dengan dashboard pengurus di kartacintamulya.org.',
      problem:
        'Pengelolaan informasi kegiatan kepemudaan, pendataan anggota, dan publikasi dokumentasi Karang Taruna Desa Cintamulya sebelumnya tersebar secara manual dan hanya mengandalkan unggahan media sosial (@karta.cintamulya), sehingga warga maupun pengurus kesulitan mencari arsip kegiatan serta informasi resmi organisasi di satu tempat terpusat.',
      role:
        'Fullstack Web Developer & Desainer Komunikasi Visual — menangani perancangan antarmuka (UI/UX) dan identitas visual organisasi, penyusunan skema database PostgreSQL & autentikasi di Supabase, pengembangan frontend responsif serta dashboard CMS dengan Next.js, hingga deployment ke domain produksi kartacintamulya.org.',
      technologies: techs,
      results: [
        'Situs resmi organisasi berjalan aktif di kartacintamulya.org sebagai pusat informasi kegiatan dan profil Karang Taruna Cintamulya.',
        'Pengurus dapat memperbarui data kegiatan dan publikasi secara mandiri melalui dashboard yang terproteksi autentikasi.',
        'Dampak terukur: melayani [ISI: angka jumlah anggota/pengurus Karang Taruna] anggota serta memublikasikan [ISI: angka jumlah kegiatan/artikel] dokumentasi kegiatan kepada warga Desa Cintamulya.',
      ],
      hasPlaceholders: true,
    };
  }

  // Untuk proyek lain: ekstrak kalimat pertama sebagai ringkasan hasil, dan tampilkan placeholder jika detail studi kasus belum diisi di Supabase
  const rawDesc = (project.description || '').trim();
  const firstSentenceMatch = rawDesc.match(/^[^.!?]+[.!?]/);
  const oneLineResult = firstSentenceMatch
    ? firstSentenceMatch[0].trim()
    : rawDesc || 'Studi kasus pengembangan dan implementasi proyek.';

  return {
    oneLineResult,
    problem:
      rawDesc ||
      '[ISI: deskripsi latar belakang masalah yang diselesaikan oleh proyek ini]',
    role:
      'Web Developer & Desainer Visual — merancang antarmuka, mengimplementasikan fitur utama, serta melakukan pengujian dan deployment. [ISI: detail peran spesifik pada proyek ini]',
    technologies: techs,
    results: [
      oneLineResult,
      'Metrik hasil: [ISI: angka atau hasil terukur dari proyek ini].',
    ],
    hasPlaceholders: true,
  };
}
