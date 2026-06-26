import type { GalleryDatabase, Project } from "./types";
import galleryData from "@/data/gallery.json";

/** Load gallery index (built by scan script, committed for Vercel deploy) */
export function getGallery(): GalleryDatabase {
  return galleryData as GalleryDatabase;
}

export function getProjects(): Project[] {
  return getGallery().projects;
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function searchProjects(query: string): Project[] {
  const q = query.trim().toLowerCase();
  if (!q) return getProjects();
  return getProjects().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.folderPath.toLowerCase().includes(q)
  );
}

export function getGalleryStats() {
  const db = getGallery();
  return {
    projectCount: db.projectCount,
    imageCount: db.imageCount,
    lastScan: db.lastFullScan,
    projectsRoot: db.projectsRoot,
  };
}
