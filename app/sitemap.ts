import type { MetadataRoute } from "next";
import { getAllBlogPosts, getAllNotes, getProjects } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/projects",
    "/blog",
    "/notes",
    "/bookshelf",
    "/contact",
    "/resume"
  ].map((route) => ({
    url: `${siteConfig.siteUrl}${route}`,
    lastModified: new Date()
  }));

  const blogRoutes = getAllBlogPosts().map((post) => ({
    url: `${siteConfig.siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt)
  }));

  const noteRoutes = getAllNotes().map((note) => ({
    url: `${siteConfig.siteUrl}/notes/${note.slug}`,
    lastModified: new Date(note.updatedAt || note.publishedAt)
  }));

  const projectRoutes = getProjects().map((project) => ({
    url: `${siteConfig.siteUrl}/projects/${project.slug}`,
    lastModified: new Date(`${project.year}-01-01`)
  }));

  return [...staticRoutes, ...blogRoutes, ...noteRoutes, ...projectRoutes];
}
