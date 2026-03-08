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
        eyebrow="learnings through"
        title="Projects"
        description="List of projects, some of them are purely learning ones, others on the use cases from work, discussions and day to day life."
      />

      <section className="section">
        <div className="container">
          <ProjectsExplorer projects={getProjects()} />
        </div>
      </section>
    </>
  );
}
