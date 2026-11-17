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
    <main id="main-content" className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      <Navbar />

      <div className="relative z-10 container mx-auto px-6 pt-28 pb-12 md:pt-32 md:pb-24 space-y-32">
        <section id="hero">
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

