"use client";

import Image from "next/image";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-lg bg-[var(--card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-keuka-accent/60"
    >
      <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden">
        {project.coverThumbnail ? (
          <Image
            src={project.coverThumbnail}
            alt={project.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--card)] text-[var(--muted)] text-sm">
            No renders
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-left">
          <h3 className="font-display text-base sm:text-lg font-medium leading-snug line-clamp-2 group-hover:text-keuka-accent transition-colors">
            {project.name}
          </h3>
          <p className="mt-1 text-xs text-white/60">
            {project.imageCount} {project.imageCount === 1 ? "photo" : "photos"}
          </p>
        </div>
      </div>
    </button>
  );
}
