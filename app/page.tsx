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
            <p className="hero-kicker">Bengaluru, India <span>Software engineer @ PhonePe</span></p>
            <h1>{siteConfig.name}</h1>
            <p className="hero-statement">Software engineer.</p>
            <p className="hero-summary">I build tools for server provisioning, inventory management, vulnerability patching, and database monitoring at PhonePe.</p>
            <div className="button-row">
              <Link className="button" href="/projects">Projects</Link>
              <Link className="ghost-button" href="/blog">Blog</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section about-section">
        <div className="container">
          <div className="about-heading"><h2>About me</h2></div>
          <div>
            {siteConfig.title ? <p className="hero__title">{siteConfig.title}</p> : null}
            {siteConfig.tagline ? <p className="lead">{siteConfig.tagline}</p> : null}

            <div className="max-width-copy">
              <p>
                I&apos;m from Patratu, Jharkhand, and live in Bengaluru.
              </p>
              <p>
                I work at{" "}
                <span style={{ color: "#c3a0f0", fontWeight: 700 }}>PhonePe</span> as a
                Software Engineer in the Tools team. Previously, I worked at Kloud9,
                Tekion and MetricStream. I hold a Bachelor&apos;s degree in Information
                Science and Engineering from{" "}
                <span className="highlight-light-blue">
                  Dayananda Sagar College of Engineering
                </span>
                .
              </p>
              <p>
                I contribute to open-source projects and volunteer. I started
                contributing through my college&apos;s Linux User Group, GLUG-DSCE.
              </p>
              <p>
                I&apos;m a{" "}
                <span style={{ color: "#f49393", fontWeight: 700 }}>Manchester United</span>{" "}
                fan. I play football and cricket, watch matches, and quiz on Tuesdays.
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
