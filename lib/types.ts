export interface RenderImage {
  id: string;
  filename: string;
  /** Path relative to project root on disk (for reference) */
  sourcePath: string;
  /** Public URL for thumbnail */
  thumbnailUrl: string;
  /** Public URL for full image (demo: same as thumb or original copy) */
  fullUrl: string;
  width: number;
  height: number;
  scannedAt: string;
}

export interface Project {
  id: string;
  name: string;
  folderPath: string;
  coverThumbnail: string;
  imageCount: number;
  images: RenderImage[];
  lastScanned: string;
}

export interface GalleryDatabase {
  version: number;
  projectsRoot: string;
  lastFullScan: string;
  /** Set when an incremental scan completes */
  lastIncrementalScan?: string;
  projectCount: number;
  imageCount: number;
  projects: Project[];
}

export interface ScanResult {
  mode: "full" | "incremental" | "dry-run";
  projectsRoot: string;
  scannedProjects: number;
  skippedProjects: number;
  newProjects: string[];
  totalProjects: number;
  totalImages: number;
  lastFullScan: string;
  lastIncrementalScan?: string;
}
