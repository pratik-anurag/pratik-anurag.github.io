import type { Project } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard } from "@/components/project-card";

type ProjectsExplorerProps = {
  projects: Project[];
};

export function ProjectsExplorer({ projects }: ProjectsExplorerProps) {
  return (
    <div className="explorer">
      {projects.length ? (
        <div className="card-grid card-grid--projects">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects yet"
          description="Projects will appear here once they are added."
        />
      )}
    </div>
  );
}
