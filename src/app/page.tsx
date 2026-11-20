import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import Services from '@/components/Services';
import Experience from '@/components/Experience';
import About from '@/components/About';
import TechStack from '@/components/TechStack';
import Certificates from '@/components/Certificates';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createSupabasePublicClient } from '@/lib/supabase-public';
import { getProjectSlug } from '@/lib/project-case-studies';

export const revalidate = 60;

export default async function Home() {
  const supabase = createSupabasePublicClient();

  const [
    projectsRes,
    projectImagesRes,
    experiencesRes,
    techRes,
    certsRes,
    allChildCertsRes,
    testimonialsRes,
  ] = await Promise.all([
    supabase.from('portfolio_projects').select('*').order('created_at', { ascending: false }),
    supabase.from('project_images').select('project_slug, image_url').order('sort_order', { ascending: true }),
    supabase.from('portfolio_experiences').select('*').order('sort_order', { ascending: true }),
    supabase.from('portfolio_tech').select('*').order('created_at', { ascending: false }),
    supabase.from('portfolio_certificates').select('*').is('parent_slug', null).order('created_at', { ascending: false }),
    supabase.from('portfolio_certificates').select('parent_slug').not('parent_slug', 'is', null),
    supabase.from('portfolio_testimonials').select('*').order('created_at', { ascending: false }),
  ]);

  // Jika proyek belum punya thumbnail utama (image_url), otomatis pakai gambar pertama dari galerinya
  const firstGalleryImageBySlug: Record<string, string> = {};
  (projectImagesRes.data || []).forEach((img) => {
    if (img.project_slug && img.image_url && !firstGalleryImageBySlug[img.project_slug]) {
      firstGalleryImageBySlug[img.project_slug] = img.image_url;
    }
  });

  const projects = (projectsRes.data || []).map((project) => {
    if (project.image_url) return project;
    const slug = getProjectSlug(project);
    const fallbackImg = firstGalleryImageBySlug[slug];
    return fallbackImg ? { ...project, image_url: fallbackImg } : project;
  });
  const experiences = experiencesRes.data || [];
  const technologies = techRes.data || [];
  const certificates = (certsRes.data || []).filter(
    (c) =>
      c.issuer?.toLowerCase() !== 'linkedin' &&
      c.title?.toLowerCase() !== 'professional network'
  );

  const childCounts: Record<string, number> = {};
  (allChildCertsRes.data || []).forEach((c) => {
    if (c.parent_slug) {
      childCounts[c.parent_slug] = (childCounts[c.parent_slug] || 0) + 1;
    }
  });

  const testimonials = testimonialsRes.data || [];

  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      <Navbar />

      {/* Urutan Beranda Prioritas 4:
          1. Hero
          2. Proyek Pilihan (#projects)
          3. Layanan (#services)
          4. Pengalaman (#experience)
          5. Tentang & Keahlian Utama (#about, #tech)
          6. Sertifikasi (#certificates) — hanya jika ada data
          7. Testimoni (#testimonials) — hanya jika ada data
          8. Kontak (#contact) */}
      <div className="relative z-10 container mx-auto px-6 pt-28 pb-12 md:pt-32 md:pb-24 space-y-28">
        <section id="hero">
          <Hero />
        </section>

        <section id="projects">
          <Projects initialProjects={projects} />
        </section>

        <section id="services">
          <Services />
        </section>

        <section id="experience">
          <Experience initialExperiences={experiences} />
        </section>

        <section id="about">
          <About />
        </section>

        <section id="tech">
          <TechStack initialTechnologies={technologies} />
        </section>

        {certificates.length > 0 && (
          <section id="certificates">
            <Certificates initialCertificates={certificates} initialChildCounts={childCounts} />
          </section>
        )}

        {testimonials.length > 0 && (
          <section id="testimonials">
            <Testimonials initialTestimonials={testimonials} />
          </section>
        )}

        <section id="contact">
          <Contact />
        </section>
      </div>

      <Footer />
    </main>
  );
}
