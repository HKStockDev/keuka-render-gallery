"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import type { Project, RenderImage } from "@/lib/types";

interface ImageLightboxProps {
  project: Project;
  imageIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ImageLightbox({
  project,
  imageIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const image: RenderImage | undefined = project.images[imageIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && imageIndex > 0) onNavigate(imageIndex - 1);
      if (e.key === "ArrowRight" && imageIndex < project.images.length - 1)
        onNavigate(imageIndex + 1);
    },
    [onClose, onNavigate, imageIndex, project.images.length]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} — ${image.filename}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 bg-black/80 backdrop-blur-sm">
        <div className="min-w-0">
          <p className="text-sm text-white/50 truncate">{project.name}</p>
          <p className="text-sm truncate">
            {image.filename} · {imageIndex + 1} / {project.images.length}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 transition shrink-0 ml-4"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-2 sm:p-6 min-h-0">
        {imageIndex > 0 && (
          <button
            type="button"
            onClick={() => onNavigate(imageIndex - 1)}
            className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 transition"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="relative w-full h-full max-w-[1400px]">
          <Image
            src={image.fullUrl}
            alt={image.filename}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {imageIndex < project.images.length - 1 && (
          <button
            type="button"
            onClick={() => onNavigate(imageIndex + 1)}
            className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 transition"
            aria-label="Next image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 p-3 overflow-x-auto gallery-scroll bg-black/80">
        <div className="flex gap-2 justify-center min-w-min px-2">
          {project.images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onNavigate(i)}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden shrink-0 border-2 transition ${
                i === imageIndex
                  ? "border-keuka-accent opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <Image src={img.thumbnailUrl} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
