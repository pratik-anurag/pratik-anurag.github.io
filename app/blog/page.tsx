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
        eyebrow=""
        title="Blog"
        description="Posts on backend development, infrastructure, and open source."
      />

      <section className="section">
        <div className="container">
          <BlogExplorer posts={getAllBlogPosts()} />
        </div>
      </section>
    </>
  );
}
