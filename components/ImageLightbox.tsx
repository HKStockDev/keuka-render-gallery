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
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} — ${image.filename}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="min-w-0">
          <h2 className="font-display text-lg truncate">{project.name}</h2>
          <p className="text-sm text-keuka-slate truncate">
            {image.filename} · {imageIndex + 1} of {project.images.length}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 transition shrink-0 ml-4"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
        {imageIndex > 0 && (
          <button
            type="button"
            onClick={() => onNavigate(imageIndex - 1)}
            className="absolute left-2 md:left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="relative w-full h-full max-w-6xl">
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
            className="absolute right-2 md:right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="shrink-0 border-t border-white/10 p-3 overflow-x-auto gallery-scroll">
        <div className="flex gap-2 justify-center min-w-min">
          {project.images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onNavigate(i)}
              className={`relative w-16 h-16 rounded-md overflow-hidden shrink-0 border-2 transition ${
                i === imageIndex ? "border-keuka-accent" : "border-transparent opacity-60 hover:opacity-100"
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
