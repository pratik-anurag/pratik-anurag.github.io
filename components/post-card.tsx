import Link from "next/link";
import type { BlogPostMeta } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type PostCardProps = {
  post: BlogPostMeta;
};

export function PostCard({ post }: PostCardProps) {
  const shouldLinkExternally = Boolean(post.externalUrl);

  return (
    <article className="card post-card">
      <div className="card__body">
        <div className="card__meta">
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.readingTime}</span>
        </div>
        <h3>
          {shouldLinkExternally ? (
            <a href={post.externalUrl} target="_blank" rel="noreferrer">
              {post.title}
            </a>
          ) : (
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          )}
        </h3>
        <p className="muted">{post.description}</p>
      </div>
    </article>
  );
}
