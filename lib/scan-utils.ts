import fs from "fs";
import path from "path";
import type { GalleryDatabase } from "./types";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveProjectsRoot(configuredRoot?: string): string {
  const root =
    configuredRoot?.trim() ||
    process.env.PROJECTS_ROOT?.trim() ||
    path.join(process.cwd(), "sample-projects");
  return path.resolve(root);
}

export function listProjectFolders(root: string): { name: string; id: string; path: string }[] {
  if (!fs.existsSync(root)) return [];

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => ({
      name: d.name,
      id: slugify(d.name),
      path: path.join(root, d.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getScanPreview(
  gallery: GalleryDatabase,
  projectsRoot?: string
): {
  projectsRoot: string;
  indexedCount: number;
  totalOnDisk: number;
  newProjects: { name: string; id: string }[];
  knownProjects: { name: string; id: string }[];
} {
  const root = resolveProjectsRoot(projectsRoot || gallery.projectsRoot);
  const onDisk = listProjectFolders(root);
  const indexedIds = new Set(gallery.projects.map((p) => p.id));

  const newProjects = onDisk
    .filter((f) => !indexedIds.has(f.id))
    .map(({ name, id }) => ({ name, id }));

  const knownProjects = onDisk
    .filter((f) => indexedIds.has(f.id))
    .map(({ name, id }) => ({ name, id }));

  return {
    projectsRoot: root,
    indexedCount: gallery.projectCount,
    totalOnDisk: onDisk.length,
    newProjects,
    knownProjects,
  };
}

export function isScanApiEnabled(): boolean {
  if (process.env.ENABLE_SCAN_API === "false") return false;
  // Vercel has read-only filesystem — scan must run locally or in CI
  if (process.env.VERCEL === "1") return false;
  return process.env.ENABLE_SCAN_API === "true" || process.env.NODE_ENV === "development";
}
