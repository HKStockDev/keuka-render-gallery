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
      className="group text-left w-full rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] hover:border-keuka-accent/40 hover:shadow-lg hover:shadow-keuka-accent/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-keuka-accent/50"
    >
      <div className="relative aspect-[4/3] bg-keuka-steel/30 overflow-hidden">
        {project.coverThumbnail ? (
          <Image
            src={project.coverThumbnail}
            alt={project.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-keuka-slate">
            No renders
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 text-xs text-white backdrop-blur-sm">
          {project.imageCount} {project.imageCount === 1 ? "render" : "renders"}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-medium text-[var(--foreground)] group-hover:text-keuka-accent transition-colors line-clamp-2">
          {project.name}
        </h3>
        <p className="mt-1 text-xs text-keuka-slate truncate">{project.folderPath}</p>
      </div>
    </button>
  );
}
