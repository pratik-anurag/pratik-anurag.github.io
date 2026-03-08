# Backend Developer Portfolio Platform

A production-ready personal portfolio built with Next.js, TypeScript, markdown content, and a lightweight JSON content model. It is designed for a backend-focused software engineer who wants to present projects, publish blogs, share learning notes, maintain a bookshelf, and provide clear contact paths.

## Why this stack

- `Next.js App Router`: strong fit for a content-heavy portfolio with SEO, static generation, route handlers, and easy deployment on Vercel.
- `TypeScript`: keeps the content model, pages, and reusable components maintainable.
- `Markdown + frontmatter`: simple authoring flow for blog posts and learning notes without needing a CMS.
- `JSON content files`: straightforward editing for projects, books, and profile data.
- `Route handlers`: enough backend capability for RSS and future lightweight integrations without adding a separate server.
- `Vanilla CSS design system`: fast, dependency-light, and easy to customize while still supporting a polished visual system and theme switching.

## Features

- Responsive, accessible portfolio pages
- Dark mode and light mode with persisted preference
- Home, About, Projects, Blog, Learning / Notes, Bookshelf, Contact, Resume
- Markdown-powered blog posts and notes
- Project detail pages with architecture highlights
- Search and filtering for projects, blog posts, notes, and books
- Reading time, table of contents, syntax highlighting, related posts
- RSS feed at `/feed.xml`
- SEO metadata, Open Graph, Twitter card support, sitemap, robots, JSON-LD
- Minimal contact page built around public profile links
- Sample content and local SVG assets ready to replace

## Project structure

```text
app/
  about/
  blog/
  bookshelf/
  contact/
  feed.xml/
  notes/
  projects/
  resume/
components/
content/
  blog/
  notes/
  books.json
  papers.json
  profile.json
  projects.json
lib/
public/
  books/
```

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env file:

   ```bash
   cp .env.example .env.local
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

## Production build

```bash
npm run build
npm run start
```

## Content editing

### Update profile and branding

Edit [content/profile.json](/Users/pratikanurag/work/test-portfolio/content/profile.json).

Replace:

- `name`, `title`, `tagline`, `summary`
- social links
- location
- years of experience placeholder
- skills, values, timeline, and current focus

### Add a blog post

Create a new markdown file in [content/blog](/Users/pratikanurag/work/test-portfolio/content/blog) with frontmatter like:

```md
---
title: "Your title"
description: "Short summary"
publishedAt: "2026-03-08"
category: "API Design"
tags:
  - api
  - backend
featured: false
draft: false
---
```

The filename becomes the slug. Draft posts stay hidden when `draft: true`.

### Add a learning note

Create a markdown file in [content/notes](/Users/pratikanurag/work/test-portfolio/content/notes) using the same frontmatter shape. Notes are intended to be shorter and are listed separately from blog posts.

### Add or edit projects

Edit [content/projects.json](/Users/pratikanurag/work/test-portfolio/content/projects.json).

Each project supports:

- title and description
- problem solved
- tech stack
- architecture highlights
- role and contributions
- GitHub and optional live demo links
- status, tags, category, year

### Add or edit books

Edit [content/books.json](/Users/pratikanurag/work/test-portfolio/content/books.json).

Each book now uses a minimal shape:

- `title`
- `author`
- optional `searchQuery`

The bookshelf links each title to a Google search result.

### Add research papers

Edit [content/papers.json](/Users/pratikanurag/work/test-portfolio/content/papers.json).

Each paper supports:

- `title`
- `authors`
- `year`
- optional `searchQuery`

## Deployment

### Recommended: Vercel

1. Push the project to GitHub.
2. Import the repo into Vercel.
3. Set environment variables from `.env.example`.
4. Set the production domain in `NEXT_PUBLIC_SITE_URL`.
5. Deploy.

Vercel is the best default here because Next.js metadata routes, static generation, and route handlers work naturally without extra server setup.

### Other hosting options

- Netlify: works well with Next.js using the official adapter/runtime.
- Cloudflare Pages: works if you prefer edge-centric deployment.

## Custom domain setup

Examples:

- `myname.dev`
- `myportfolio.com`

### On Vercel

1. Open your project dashboard.
2. Go to `Settings -> Domains`.
3. Add your custom domain.
4. In your DNS provider, add the records Vercel shows you.

Typical DNS patterns:

- Apex/root domain:
  - `A` record pointing to `76.76.21.21`
- `www` subdomain:
  - `CNAME` pointing to `cname.vercel-dns.com`

Vercel may also ask for verification records depending on the registrar.

### Important domain-related updates

- Set `NEXT_PUBLIC_SITE_URL=https://myname.dev`
- Redeploy after changing the domain
- Confirm the generated sitemap, canonical tags, and RSS links now use the real domain

## SEO and discoverability

Included by default:

- metadata titles and descriptions
- Open Graph and Twitter cards
- canonical URLs
- sitemap
- robots.txt
- structured data
- RSS feed

To improve SEO further:

- replace placeholder text with your real experience and project outcomes
- add unique OG images per project or blog post if needed
- connect Search Console after the site is live

## Customization notes

- Change the visual theme in [app/globals.css](/Users/pratikanurag/work/test-portfolio/app/globals.css)
- Update shared metadata helpers in [lib/site.ts](/Users/pratikanurag/work/test-portfolio/lib/site.ts)
- Modify content loading logic in [lib/content.ts](/Users/pratikanurag/work/test-portfolio/lib/content.ts)
- Adjust contact links in [content/profile.json](/Users/pratikanurag/work/test-portfolio/content/profile.json)

## Optional CMS upgrade path

The current setup stays intentionally simple. If you later want an editor-facing CMS, this project can be upgraded to:

- Sanity
- Contentful
- Decap CMS

The clean content boundaries in `content/` make that migration manageable.
