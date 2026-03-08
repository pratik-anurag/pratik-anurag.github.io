import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StructuredData } from "@/components/structured-data";
import { getProject, getProjects } from "@/lib/content";
import { siteConfig } from "@/lib/site";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getProjects().map((project) => ({
    slug: project.slug
  }));
}

export async function generateMetadata({
  params
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return {
      title: "Project not found"
    };
  }

  return {
    title: project.title,
    description: project.excerpt,
    alternates: {
      canonical: `${siteConfig.siteUrl}/projects/${project.slug}`
    },
    openGraph: {
      title: project.title,
      description: project.excerpt,
      url: `${siteConfig.siteUrl}/projects/${project.slug}`,
      images: [siteConfig.ogImage]
    }
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareSourceCode",
          name: project.title,
          description: project.description,
          codeRepository: project.githubUrl,
          programmingLanguage: project.techStack.join(", "),
          url: `${siteConfig.siteUrl}/projects/${project.slug}`
        }}
      />

      <section className="section project-detail">
        <div className="container">
          <Link href="/projects" className="back-link">
            ← Back to projects
          </Link>

          <div className="project-detail__header">
            <div>
              <h1>{project.title}</h1>
              <p className="lead">{project.excerpt}</p>
              <div className="card__meta">
                <span className="status-pill">{project.status}</span>
                <span>{project.year}</span>
              </div>
              <div className="button-row">
                <a className="button" href={project.githubUrl} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                {project.demoUrl ? (
                  <a
                    className="button button--secondary"
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Live demo
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="project-detail__grid">
            <article className="card">
              <div className="card__body">
                <p className="eyebrow">Overview</p>
                <h2>Description</h2>
                <p>{project.description}</p>
                <h3>Problem solved</h3>
                <p>{project.problemSolved}</p>
                <h3>Role and contributions</h3>
                <p>{project.role}</p>
                <ul className="bullet-list">
                  {project.contributions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>

            <aside className="detail-sidebar">
              <article className="card">
                <div className="card__body">
                  <p className="eyebrow">Architecture highlights</p>
                  <ul className="bullet-list">
                    {project.architectureHighlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
