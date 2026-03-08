import { BookshelfExplorer } from "@/components/bookshelf-explorer";
import { PageHero } from "@/components/page-hero";
import { createMetadata } from "@/lib/site";
import { getBooks, getPapers } from "@/lib/content";

export const metadata = createMetadata({
  title: "Bookshelf",
  description: "A minimal reading list of books and research papers related to backend engineering.",
  path: "/bookshelf"
});

export default function BookshelfPage() {
  return (
    <>
      <PageHero
        eyebrow="Bookshelf"
        title="Books and research papers"
        description="A minimal reading list with quick links to search each title."
      />

      <section className="section">
        <div className="container">
          <BookshelfExplorer books={getBooks()} papers={getPapers()} />
        </div>
      </section>
    </>
  );
}
