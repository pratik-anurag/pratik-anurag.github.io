import { BlogExplorer } from "@/components/blog-explorer";
import { PageHero } from "@/components/page-hero";
import { createMetadata } from "@/lib/site";
import { getAllBlogPosts } from "@/lib/content";

export const metadata = createMetadata({
  title: "Blog",
  description: "Long-form writing on backend development, APIs, distributed systems, and operational engineering.",
  path: "/blog"
});

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Thoughts on learnings and findings"
        description="Posts on learning from work projects, self studying, open source heists"
      />

      <section className="section">
        <div className="container">
          <BlogExplorer posts={getAllBlogPosts()} />
        </div>
      </section>
    </>
  );
}
