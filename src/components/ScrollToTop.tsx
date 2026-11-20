"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Menyembunyikan tombol di halaman admin
  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    const toggleVisibility = () => {
      // Munculkan tombol setelah scroll 300px ke bawah
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isAdminPage) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-cyan-500/20 group ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      aria-label="Kembali ke atas"
    >
      <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
    </button>
  );
}
