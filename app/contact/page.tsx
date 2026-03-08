import { PageHero } from "@/components/page-hero";
import { createMetadata, siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Contact",
  description: "Reach out for backend engineering opportunities, technical writing, or project collaboration.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact"
        description="Find me on the platforms below."
      />

      <section className="section">
        <div className="container">
          <article className="card">
            <div className="card__body">
              <p className="eyebrow">Links</p>
              <p className="muted">{siteConfig.availability}</p>
              <ul className="bullet-list">
                {siteConfig.socials.map((social) => (
                  <li key={social.label}>
                    <a href={social.href} target="_blank" rel="noreferrer">
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
