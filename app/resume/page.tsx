import { PageHero } from "@/components/page-hero";
import { createMetadata } from "@/lib/site";

export const metadata = createMetadata({
  title: "Resume",
  description: "View and download my latest resume PDF.",
  path: "/resume"
});

export default function ResumePage() {
  return (
    <>
      <PageHero eyebrow="Resume" title="" description="" />

      <section className="section">
        <div className="container">
          <article className="card">
            <div className="card__body">
              <p>
                <a href="/Pratik_Anurag_9yoe.pdf" target="_blank" rel="noreferrer">
                  Open resume PDF in a new tab
                </a>
              </p>
              <iframe
                src="/Pratik_Anurag_9yoe.pdf"
                title="Pratik Anurag Resume"
                style={{ width: "100%", minHeight: "80vh", border: "none" }}
              />
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
