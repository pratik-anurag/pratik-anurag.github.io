import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/components/markdown-article";
import { StructuredData } from "@/components/structured-data";
import { TableOfContents } from "@/components/toc";
import { getAllNotes, getNote } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils";

type NotePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllNotes().map((note) => ({
    slug: note.slug
  }));
}

export async function generateMetadata({
  params
}: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNote(slug);

  if (!note) {
    return {
      title: "Note not found"
    };
  }

  return {
    title: note.title,
    description: note.description,
    alternates: {
      canonical: `${siteConfig.siteUrl}/notes/${note.slug}`
    }
  };
}

export default async function NoteDetailPage({ params }: NotePageProps) {
  const { slug } = await params;
  const note = await getNote(slug);

  if (!note) {
    notFound();
  }

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: note.title,
          description: note.description,
          datePublished: note.publishedAt,
          author: {
            "@type": "Person",
            name: siteConfig.name
          }
        }}
      />

      <section className="section article-shell">
        <div className="container">
          <Link href="/notes" className="back-link">
            ← Back to learning notes
          </Link>

          <header className="article-header">
            <h1>{note.title}</h1>
            <p className="lead">{note.description}</p>
            <div className="card__meta">
              <span>{formatDate(note.publishedAt)}</span>
              <span>{note.readingTime}</span>
            </div>
          </header>

          <div className="article-layout">
            <MarkdownArticle html={note.html} />
            <TableOfContents headings={note.headings} />
          </div>
        </div>
      </section>
    </>
  );
}
