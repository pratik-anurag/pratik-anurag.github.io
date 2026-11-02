import { PageHero } from "@/components/page-hero";
import { ProjectsExplorer } from "@/components/projects-explorer";
import { createMetadata } from "@/lib/site";
import { getProjects } from "@/lib/content";

export const metadata = createMetadata({
  title: "Projects",
  description: "",
  path: "/projects"
});

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow=""
        title="Projects"
        description="Tools and experiments from work and personal projects."
      />

      <section className="section">
        <div className="container">
          <ProjectsExplorer projects={getProjects()} />
        </div>
      </section>
    </>
  );
}
