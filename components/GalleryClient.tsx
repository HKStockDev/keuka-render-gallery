"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import SearchBar from "@/components/SearchBar";
import ProjectGrid from "@/components/ProjectGrid";
import RenderMasonry from "@/components/RenderMasonry";
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

  function backToGrid() {
    setSelectedProject(null);
    setView("grid");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-[var(--background)]/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            {view === "detail" && selectedProject && (
              <button
                type="button"
                onClick={backToGrid}
                className="p-2 -ml-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition shrink-0"
                aria-label="Back to all projects"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
                {view === "detail" && selectedProject
                  ? selectedProject.name
                  : "Keuka Studios"}
              </h1>
              <p className="text-sm text-[var(--muted)] mt-0.5 truncate">
                {view === "detail" && selectedProject
                  ? `${selectedProject.imageCount} photos`
                  : "Project Render Gallery"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {view === "grid" ? (
          <>
            <SearchBar
              value={query}
              onChange={setQuery}
              projectCount={filtered.length}
              totalProjectCount={projects.length}
              imageCount={filteredImageCount}
            />
            <div className="mt-6 sm:mt-8">
              <ProjectGrid projects={filtered} onSelectProject={openProject} />
            </div>
          </>
        ) : selectedProject ? (
          <RenderMasonry
            images={selectedProject.images}
            onSelect={setLightboxIndex}
          />
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

      <footer className="mt-20 py-8 border-t border-[var(--border)]/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <p>Keuka Studios · Custom Architectural Metal Fabrication</p>
          <Link href="/admin" className="hover:text-keuka-accent transition">
            Scan admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
