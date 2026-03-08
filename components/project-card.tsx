import Link from "next/link";
import type { Project } from "@/lib/types";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="card project-card">
      <div className="card__body">
        <div className="card__meta">
          {project.status !== "completed" ? (
            <span className="status-pill">{project.status}</span>
          ) : null}
          <span>{project.year}</span>
        </div>

        <h3>
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        <p className="muted">{project.excerpt}</p>

        <div className="link-row">
          <Link href={`/projects/${project.slug}`}>Project details</Link>
          <a href={project.githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
          {project.demoUrl ? (
            <a href={project.demoUrl} target="_blank" rel="noreferrer">
              Live demo
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
