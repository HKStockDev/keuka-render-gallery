"use client";

import Image from "next/image";
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
      <div className="text-center py-16 text-keuka-slate">
        <p className="text-lg">No projects match your search.</p>
        <p className="text-sm mt-2">Try a different project name or clear the filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
