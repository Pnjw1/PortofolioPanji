"use client";

import { useState } from 'react';
import Image from 'next/image';

export interface ProjectImageItem {
  id: number;
  image_url: string;
  caption?: string | null;
  alt_text?: string | null;
}

export default function ProjectGallery({
  coverUrl,
  coverAlt,
  images,
}: {
  coverUrl?: string | null;
  coverAlt: string;
  images: ProjectImageItem[];
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage}
            alt="Pratinjau gambar proyek"
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
          />
          <p className="absolute bottom-6 text-zinc-400 text-sm font-mono">
            Klik di mana saja untuk menutup
          </p>
        </div>
      )}

      {/* Cover Image */}
      {coverUrl && (
        <div
          className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 cursor-pointer"
          onClick={() => setSelectedImage(coverUrl)}
        >
          <Image
            src={coverUrl}
            alt={coverAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover object-top hover:scale-[1.01] transition-transform duration-500 motion-reduce:transition-none motion-reduce:hover:scale-100"
            priority
          />
        </div>
      )}

      {/* Additional Screenshots */}
      {images.length > 0 && (
        <section className="space-y-5 pt-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Tangkapan Layar &amp; Dokumentasi Visual
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 cursor-pointer hover:border-cyan-500/50 transition-colors"
                onClick={() => setSelectedImage(img.image_url)}
              >
                <div className="relative w-full aspect-video">
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || img.caption || `Tangkapan layar ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                {img.caption && (
                  <div className="p-3 bg-zinc-950/90 border-t border-zinc-800">
                    <p className="text-xs text-zinc-300 font-mono">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
