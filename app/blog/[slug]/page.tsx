import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/components/markdown-article";
import { PostCard } from "@/components/post-card";
import { StructuredData } from "@/components/structured-data";
import { TableOfContents } from "@/components/toc";
import { getAllBlogPosts, getBlogPost, getRelatedPosts } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({
  params
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Post not found"
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `${siteConfig.siteUrl}/blog/${post.slug}`
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteConfig.siteUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post);

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: post.title,
          description: post.description,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt || post.publishedAt,
          author: {
            "@type": "Person",
            name: siteConfig.name
          },
          publisher: {
            "@type": "Person",
            name: siteConfig.name
          },
          mainEntityOfPage: `${siteConfig.siteUrl}/blog/${post.slug}`
        }}
      />

      <section className="section article-shell">
        <div className="container">
          <Link href="/blog" className="back-link">
            ← Back to blog
          </Link>

          <header className="article-header">
            <h1>{post.title}</h1>
            <p className="lead">{post.description}</p>
            <div className="card__meta">
              <span>{formatDate(post.publishedAt)}</span>
              <span>{post.readingTime}</span>
              {post.updatedAt ? <span>Updated {formatDate(post.updatedAt)}</span> : null}
            </div>
          </header>

          <div className="article-layout">
            <MarkdownArticle html={post.html} />
            <TableOfContents headings={post.headings} />
          </div>

          {relatedPosts.length ? (
            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Related posts</p>
                  <h2>More on similar themes</h2>
                </div>
              </div>
              <div className="card-grid">
                {relatedPosts.map((item) => (
                  <PostCard key={item.slug} post={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </>
  );
}
