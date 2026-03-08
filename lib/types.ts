export type SocialLink = {
  label: string;
  href: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type TimelineItem = {
  period: string;
  title: string;
  description: string;
};

export type Project = {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  problemSolved: string;
  techStack: string[];
  architectureHighlights: string[];
  role: string;
  contributions: string[];
  githubUrl: string;
  demoUrl?: string;
  status: "completed" | "ongoing" | "archived";
  tags: string[];
  category: string;
  featured: boolean;
  year: string;
};

export type ReadingItem = {
  slug: string;
  title: string;
  searchQuery?: string;
};

export type Book = ReadingItem & {
  author: string;
};

export type ResearchPaper = ReadingItem & {
  authors: string[];
  year: string;
};

export type Profile = {
  name: string;
  shortName: string;
  title: string;
  tagline: string;
  intro: string;
  summary: string;
  yearsExperience: string;
  location: string;
  availability: string;
  resumeHref: string;
  techHighlights: string[];
  backendSpecialization: string[];
  interests: string[];
  values: string[];
  currentFocus: string[];
  socials: SocialLink[];
  skills: SkillGroup[];
  timeline: TimelineItem[];
};

export type MarkdownFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  externalUrl?: string;
  category: string;
  tags: string[];
  featured?: boolean;
  draft?: boolean;
};

export type MarkdownHeading = {
  id: string;
  text: string;
  level: number;
};

export type BlogPostMeta = MarkdownFrontmatter & {
  slug: string;
  readingTime: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
  html: string;
  headings: MarkdownHeading[];
};

export type NoteMeta = MarkdownFrontmatter & {
  slug: string;
  readingTime: string;
};

export type Note = NoteMeta & {
  content: string;
  html: string;
  headings: MarkdownHeading[];
};
