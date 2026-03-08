import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import books from "@/content/books.json";
import papers from "@/content/papers.json";
import projects from "@/content/projects.json";
import type {
  BlogPost,
  BlogPostMeta,
  Book,
  MarkdownFrontmatter,
  MarkdownHeading,
  Note,
  NoteMeta,
  Project,
  ResearchPaper
} from "@/lib/types";
import { pickRelatedTags, slugify, sortByDateDesc, unique } from "@/lib/utils";

const CONTENT_ROOT = path.join(process.cwd(), "content");

type MarkdownCollectionName = "blog" | "notes";

type MarkdownEntry = {
  slug: string;
  frontmatter: MarkdownFrontmatter;
  content: string;
};

function getDirectoryPath(collection: MarkdownCollectionName) {
  return path.join(CONTENT_ROOT, collection);
}

function collectNodeText(node: unknown): string {
  if (!node || typeof node !== "object") {
    return "";
  }

  const current = node as { value?: string; children?: unknown[] };

  if (typeof current.value === "string") {
    return current.value;
  }

  if (Array.isArray(current.children)) {
    return current.children.map(collectNodeText).join("");
  }

  return "";
}

function getMarkdownEntries(collection: MarkdownCollectionName): MarkdownEntry[] {
  const directory = getDirectoryPath(collection);

  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const source = fs.readFileSync(path.join(directory, file), "utf8");
      const { data, content } = matter(source);

      return {
        slug,
        frontmatter: data as MarkdownFrontmatter,
        content
      };
    });
}

async function markdownToHtml(content: string) {
  const processor = remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        ariaLabel: "Link to section"
      },
      content: {
        type: "text",
        value: " #"
      }
    })
    .use(rehypeHighlight)
    .use(rehypeStringify);

  const file = await processor.process(content);
  return String(file);
}

function extractHeadings(content: string): MarkdownHeading[] {
  const tree = remark().use(remarkGfm).parse(content);
  const headings: MarkdownHeading[] = [];
  const seen = new Map<string, number>();

  visit(tree, "heading", (node: { depth: number; children?: unknown[] }) => {
    if (node.depth < 2 || node.depth > 3) {
      return;
    }

    const text = collectNodeText(node).trim();

    if (!text) {
      return;
    }

    const baseId = slugify(text);
    const nextCount = (seen.get(baseId) || 0) + 1;
    seen.set(baseId, nextCount);

    headings.push({
      id: nextCount > 1 ? `${baseId}-${nextCount}` : baseId,
      text,
      level: node.depth
    });
  });

  return headings;
}

function toMeta({
  slug,
  frontmatter,
  content
}: MarkdownEntry): BlogPostMeta | NoteMeta {
  return {
    slug,
    ...frontmatter,
    readingTime: readingTime(content).text
  };
}

function filterDrafts<T extends { draft?: boolean }>(
  items: T[],
  includeDrafts = false
) {
  return includeDrafts ? items : items.filter((item) => !item.draft);
}

export function getAllBlogPosts(includeDrafts = false): BlogPostMeta[] {
  const entries = getMarkdownEntries("blog").map(toMeta) as BlogPostMeta[];
  return sortByDateDesc(filterDrafts(entries, includeDrafts));
}

export async function getBlogPost(
  slug: string,
  includeDrafts = false
): Promise<BlogPost | null> {
  const entry = getMarkdownEntries("blog").find((item) => item.slug === slug);

  if (!entry || (!includeDrafts && entry.frontmatter.draft)) {
    return null;
  }

  return {
    ...(toMeta(entry) as BlogPostMeta),
    content: entry.content,
    html: await markdownToHtml(entry.content),
    headings: extractHeadings(entry.content)
  };
}

export function getAllNotes(includeDrafts = false): NoteMeta[] {
  const entries = getMarkdownEntries("notes").map(toMeta) as NoteMeta[];
  return sortByDateDesc(filterDrafts(entries, includeDrafts));
}

export async function getNote(
  slug: string,
  includeDrafts = false
): Promise<Note | null> {
  const entry = getMarkdownEntries("notes").find((item) => item.slug === slug);

  if (!entry || (!includeDrafts && entry.frontmatter.draft)) {
    return null;
  }

  return {
    ...(toMeta(entry) as NoteMeta),
    content: entry.content,
    html: await markdownToHtml(entry.content),
    headings: extractHeadings(entry.content)
  };
}

export function getRelatedPosts(post: BlogPostMeta, limit = 3) {
  return getAllBlogPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      post: candidate,
      overlap: pickRelatedTags(candidate.tags, post.tags).length
    }))
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((item) => item.post);
}

export function getProjects(): Project[] {
  return projects as Project[];
}

export function getFeaturedProjects(limit = 3) {
  return getProjects()
    .filter((project) => project.featured)
    .slice(0, limit);
}

export function getProject(slug: string) {
  return getProjects().find((project) => project.slug === slug) || null;
}

export function getBooks(): Book[] {
  return books as Book[];
}

export function getFeaturedBooks(limit = 4) {
  return getBooks().slice(0, limit);
}

export function getPapers(): ResearchPaper[] {
  return papers as ResearchPaper[];
}

export function getFeaturedPapers(limit = 4) {
  return getPapers().slice(0, limit);
}

export function getProjectCategories() {
  return unique(getProjects().map((project) => project.category));
}

export function getProjectTags() {
  return unique(getProjects().flatMap((project) => project.tags));
}

export function getBlogCategories() {
  return unique(getAllBlogPosts().map((post) => post.category));
}

export function getBlogTags() {
  return unique(getAllBlogPosts().flatMap((post) => post.tags));
}

export function getNoteTopics() {
  return unique(getAllNotes().flatMap((note) => note.tags));
}
