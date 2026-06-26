"use client";

import type { Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export default function ProjectGrid({
  projects,
  onSelectProject,
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-24 text-[var(--muted)]">
        <p className="text-lg text-[var(--foreground)]">No projects found</p>
        <p className="text-sm mt-2">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onSelectProject(project)}
        />
      ))}
    </div>
  );
}
