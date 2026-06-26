import { getProjects, getGalleryStats } from "@/lib/gallery";
import GalleryClient from "@/components/GalleryClient";

export default function HomePage() {
  const projects = getProjects();
  const stats = getGalleryStats();

  return <GalleryClient projects={projects} stats={stats} />;
}
