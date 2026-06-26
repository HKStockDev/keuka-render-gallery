"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { Project } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import ProjectGrid from "@/components/ProjectGrid";
import ImageLightbox from "@/components/ImageLightbox";

interface GalleryClientProps {
  projects: Project[];
  stats: {
    projectCount: number;
    imageCount: number;
    lastScan: string;
    projectsRoot: string;
  };
}

export default function GalleryClient({ projects, stats }: GalleryClientProps) {
  const [query, setQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [view, setView] = useState<"grid" | "detail">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.folderPath.toLowerCase().includes(q)
    );
  }, [projects, query]);

  const filteredImageCount = filtered.reduce((n, p) => n + p.imageCount, 0);

  function openProject(project: Project) {
    setSelectedProject(project);
    setLightboxIndex(null);
    setView("detail");
  }

  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  function backToGrid() {
    setSelectedProject(null);
    setView("grid");
  }

  const lastScanDate = new Date(stats.lastScan).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            {view === "detail" && selectedProject && (
              <button
                type="button"
                onClick={backToGrid}
                className="p-2 rounded-lg hover:bg-white/5 transition shrink-0"
                aria-label="Back to projects"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                Keuka Studios
              </h1>
              <p className="text-sm text-keuka-slate mt-0.5">
                Project Render Gallery
                {view === "detail" && selectedProject && (
                  <span className="text-keuka-accent"> · {selectedProject.name}</span>
                )}
              </p>
            </div>
            <div className="hidden md:block text-right text-xs text-keuka-slate shrink-0">
              <p>Last scan: {lastScanDate}</p>
              <p className="mt-0.5">Source: {stats.projectsRoot}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === "grid" ? (
          <>
            <SearchBar
              value={query}
              onChange={setQuery}
              projectCount={filtered.length}
              imageCount={filteredImageCount}
            />

            <div className="mt-8">
              <ProjectGrid projects={filtered} onSelectProject={openProject} />
            </div>

            {/* Demo banner */}
            <div className="mt-12 p-4 rounded-xl border border-keuka-accent/20 bg-keuka-accent/5 text-sm text-keuka-slate">
              <strong className="text-keuka-accent">Demo mode</strong> — Sample project folders
              are included. Point the scan script at your server directory, re-run{" "}
              <code className="px-1.5 py-0.5 rounded bg-black/30 text-xs">npm run scan</code>,
              and redeploy to load your real renders.
            </div>
          </>
        ) : selectedProject ? (
          <>
            <div className="mb-6">
              <h2 className="font-display text-xl">{selectedProject.name}</h2>
              <p className="text-sm text-keuka-slate mt-1">
                {selectedProject.imageCount} renders · {selectedProject.folderPath}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedProject.images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => openLightbox(i)}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-[var(--card)] border border-[var(--border)] hover:border-keuka-accent/40 transition focus:outline-none focus:ring-2 focus:ring-keuka-accent/50"
                >
                  <Image
                    src={img.thumbnailUrl}
                    alt={img.filename}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-xs truncate text-white/90">{img.filename}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </main>

      {selectedProject && lightboxIndex !== null && view === "detail" && (
        <ImageLightbox
          project={selectedProject}
          imageIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      <footer className="border-t border-[var(--border)] mt-16 py-6 text-center text-xs text-keuka-slate">
        Keuka Studios · Custom Architectural Metal Fabrication · Western New York
      </footer>
    </div>
  );
}
