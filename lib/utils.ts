export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function absoluteUrl(path = "") {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://myname.dev";

  if (!path) {
    return base;
  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function sortByDateDesc<T extends { publishedAt: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });
}

export function pickRelatedTags(tags: string[], compareTags: string[]) {
  return tags.filter((tag) => compareTags.includes(tag));
}

export function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function googleSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function isWorkBlog(post: { category: string; tags: string[] }) {
  return (
    post.category.toLowerCase() === "work" ||
    post.tags.some((tag) => tag.toLowerCase() === "work")
  );
}
