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
            {siteConfig.title ? <p className="hero__title">{siteConfig.title}</p> : null}
            {siteConfig.tagline ? <p className="lead">{siteConfig.tagline}</p> : null}

            <div className="max-width-copy">
              <p>
                Hi! I am Pratik. I come from Patratu, Jharkhand, and I am currently
                staying and working in Bengaluru, Karnataka.
              </p>
              <p>
                I work at{" "}
                <span style={{ color: "#5f259f", fontWeight: 700 }}>PhonePe</span> as a
                Software Engineer in the Tools team. My work involves developing
                tools and binaries for a variety of platform operations, including
                inventory control and management, bare-metal and virtual machine
                provisioning, system vulnerability patching, and database activity
                monitoring, among others. Prior to PhonePe, I worked at Kloud9,
                Tekion and MetricStream. I hold a Bachelor&apos;s degree in Information
                Science and Engineering from Dayananda Sagar College of Engineering.
              </p>
              <p>
                In my free time, I enjoy contributing to open-source projects and
                volunteering for the community. I was a member of my college&apos;s Linux
                User Group, GLUG-DSCE, where I started my open-source journey.
              </p>
              <p>
                Outside of work, I am a proud{" "}
                <span style={{ color: "#c1121f", fontWeight: 700 }}>Manchester United</span>{" "}
                fan. I love playing football/cricket and watching matches whenever
                possible. Additionally, I enjoy quizzing every Tuesday.
              </p>
            </div>
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
