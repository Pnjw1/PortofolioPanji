import Hero from '@/components/Hero';
import About from '@/components/About';
import TechStack from '@/components/TechStack';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Certificates from '@/components/Certificates';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Background ambient glow - Tema Cyberpunk halus */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-900/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[150px]" />
      </div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-6 pt-28 pb-12 md:pt-32 md:pb-24 space-y-32">
        <section id="hero">
          {/* Hidden h1 for SEO: Google needs a primary heading */}
          <h1 className="sr-only">Panji Wiguna — Visual Communication Design (DKV) & Fullstack Developer di Jatinangor, Indonesia</h1>
          <Hero />
        </section>
        <section id="about">
          <About />
        </section>
        <section id="experience">
          <Experience />
        </section>
        <section id="tech">
          <TechStack />
        </section>
        <section id="projects">
          <Projects />
        </section>
        <section id="certificates">
          <Certificates />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="contact">
          <Contact />
        </section>
      </div>

      <Footer />
    </main>
  );
}

