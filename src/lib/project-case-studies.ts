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

const CASE_STUDY_MARKER = '<!--case_study:';

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

// Menggabungkan 4 input studi kasus dari Admin Panel ke dalam string description
// sehingga tersimpan di Supabase tanpa perlu menambah kolom baru di database.
export function serializeCaseStudyToDescription(input: {
  oneLineResult: string;
  problem: string;
  role: string;
  resultsText: string;
}): string {
  const summary = input.oneLineResult.trim();
  const payload = {
    oneLineResult: summary,
    problem: input.problem.trim(),
    role: input.role.trim(),
    results: input.resultsText
      .split('\n')
      .map((line) => line.replace(/^[-•*]\s*/, '').trim())
      .filter((line) => line.length > 0),
  };
  return `${summary}\n${CASE_STUDY_MARKER}${JSON.stringify(payload)}-->`;
}

export function buildCaseStudy(project: ProjectRecord): CaseStudySections {
  const techs =
    project.tech_array && project.tech_array.length > 0
      ? project.tech_array
      : ['Next.js', 'Tailwind CSS', 'Supabase'];

  const rawDesc = project.description || '';

  // 1. Cek apakah sudah pernah disimpan lewat Admin Panel (memiliki metadata <!--case_study:{...}-->)
  const markerIdx = rawDesc.indexOf(CASE_STUDY_MARKER);
  if (markerIdx !== -1) {
    const endIdx = rawDesc.lastIndexOf('-->');
    if (endIdx > markerIdx) {
      const jsonStr = rawDesc.slice(markerIdx + CASE_STUDY_MARKER.length, endIdx);
      try {
        const parsed = JSON.parse(jsonStr);
        const visibleSummary = rawDesc.slice(0, markerIdx).trim();
        const oneLine = parsed.oneLineResult || visibleSummary || project.title;
        const resultsArr =
          Array.isArray(parsed.results) && parsed.results.length > 0
            ? parsed.results
            : [oneLine];
        return {
          oneLineResult: oneLine,
          problem: parsed.problem || visibleSummary || '-',
          role: parsed.role || 'Web Developer & Desainer Visual',
          technologies: techs,
          results: resultsArr,
          hasPlaceholders:
            oneLine.includes('[ISI:') ||
            (parsed.problem || '').includes('[ISI:') ||
            (parsed.role || '').includes('[ISI:') ||
            resultsArr.some((r: string) => r.includes('[ISI:')),
        };
      } catch {
        // Lanjut ke fallback di bawah jika JSON rusak
      }
    }
  }

  // 2. Draf Studi Kasus default untuk Sistem Informasi Karang Taruna (kartacintamulya.org)
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

  // 3. Fallback untuk proyek lain yang belum diedit studi kasusnya di Admin Panel
  const cleanDesc = rawDesc.trim();
  const firstSentenceMatch = cleanDesc.match(/^[^.!?]+[.!?]/);
  const oneLineResult = firstSentenceMatch
    ? firstSentenceMatch[0].trim()
    : cleanDesc || 'Studi kasus pengembangan dan implementasi proyek.';

  return {
    oneLineResult,
    problem:
      cleanDesc ||
      '[ISI: deskripsi latar belakang masalah yang diselesaikan oleh proyek ini]',
    role:
      'Web Developer & Desainer Visual — merancang antarmuka, mengimplementasikan fitur utama, serta melakukan pengujian dan deployment.',
    technologies: techs,
    results: [oneLineResult],
    hasPlaceholders: cleanDesc.includes('[ISI:'),
  };
}
