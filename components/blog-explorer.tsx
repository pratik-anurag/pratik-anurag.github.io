"use client";

import { useMemo, useState } from "react";
import type { BlogPostMeta } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";
import { isWorkBlog } from "@/lib/utils";

type BlogExplorerProps = {
  posts: BlogPostMeta[];
};

export function BlogExplorer({ posts }: BlogExplorerProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "work">("personal");

  const { personalPosts, workPosts } = useMemo(() => {
    const personal = posts.filter((post) => !isWorkBlog(post));
    const work = posts.filter((post) => isWorkBlog(post));
    return { personalPosts: personal, workPosts: work };
  }, [posts]);

  const filteredPosts = activeTab === "personal" ? personalPosts : workPosts;
  const groups = filteredPosts.reduce<Record<string, BlogPostMeta[]>>((acc, post) => {
    const year = new Date(post.publishedAt).getFullYear().toString();
    acc[year] = [...(acc[year] || []), post];
    return acc;
  }, {});
  const groupedYears = Object.keys(groups).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="explorer">
      {posts.length ? (
        <>
          <div className="chip-row blog-tabs" role="tablist" aria-label="Blog categories">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "personal"}
              className={activeTab === "personal" ? "chip chip--active" : "chip"}
              onClick={() => setActiveTab("personal")}
            >
              Personal ({personalPosts.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "work"}
              className={activeTab === "work" ? "chip chip--active" : "chip"}
              onClick={() => setActiveTab("work")}
            >
              Work ({workPosts.length})
            </button>
          </div>

          {filteredPosts.length ? (
            <div className="stacked-cards">
              {groupedYears.map((year) => (
                <section className="blog-year-group" key={year}>
                  <h3 className="blog-year-group__title">{year}</h3>
                  <div className="card-grid">
                    {groups[year].map((post) => (
                      <PostCard key={post.slug} post={post} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <EmptyState
              title={`No ${activeTab} posts yet`}
              description="Publish a post to populate this section."
            />
          )}
        </>
      ) : (
        <EmptyState
          title="No blog posts found"
          description="Publish a post to populate this section."
        />
      )}
    </div>
  );
}
