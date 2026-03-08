import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import {
  getAllBlogPosts,
  getAllNotes,
  getFeaturedProjects
} from "@/lib/content";
import { createMetadata, siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: `${siteConfig.name} | Garuna Kitarp`,
  description: siteConfig.tagline,
  path: "/"
});

export default function HomePage() {
  const featuredProjects = getFeaturedProjects(3);
  const latestPosts = getAllBlogPosts().slice(0, 3);
  const latestNotes = getAllNotes().slice(0, 3);

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: siteConfig.name,
          jobTitle: siteConfig.title,
          description: siteConfig.summary,
          url: siteConfig.siteUrl,
          sameAs: siteConfig.socials.map((item) => item.href)
        }}
      />

      <section className="hero">
        <div className="container hero__content">
          <div>
            <h1>{siteConfig.name}</h1>
            <p className="hero__title">{siteConfig.title}</p>
            <p className="lead">{siteConfig.tagline}</p>
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container split-section">
          <div>
            <SectionHeading
              title="Blog"
              action={<Link href="/blog">See all posts</Link>}
            />
            <div className="stacked-cards">
              {latestPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              title="Notes"
              action={<Link href="/notes">Browse notes</Link>}
            />
            <div className="stacked-cards">
              {latestNotes.map((note) => (
                <article className="card compact-note" key={note.slug}>
                  <div className="card__body">
                    <h3>
                      <Link href={`/notes/${note.slug}`}>{note.title}</Link>
                    </h3>
                    <p className="muted">{note.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            title="Projects"
            action={<Link href="/projects">All projects</Link>}
          />

          <div className="card-grid card-grid--projects">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
