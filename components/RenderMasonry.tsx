"use client";

import Image from "next/image";
import type { RenderImage } from "@/lib/types";

interface RenderMasonryProps {
  images: RenderImage[];
  onSelect: (index: number) => void;
}

export default function RenderMasonry({ images, onSelect }: RenderMasonryProps) {
  return (
    <div className="masonry-grid">
      {images.map((img, i) => {
        const aspect =
          img.width && img.height ? `${img.width} / ${img.height}` : "4 / 3";

        return (
          <button
            key={img.id}
            type="button"
            onClick={() => onSelect(i)}
            className="masonry-item group relative w-full overflow-hidden rounded-lg bg-[var(--card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-keuka-accent/60"
            style={{ aspectRatio: aspect }}
          >
            <Image
              src={img.thumbnailUrl}
              alt={img.filename}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, 20vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs truncate text-white/90">{img.filename}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
