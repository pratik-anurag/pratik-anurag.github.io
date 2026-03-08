import type { Book, ResearchPaper } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";
import { ResourceList } from "@/components/resource-list";

type BookshelfExplorerProps = {
  books: Book[];
  papers: ResearchPaper[];
};

export function BookshelfExplorer({
  books,
  papers
}: BookshelfExplorerProps) {
  const hasResults = books.length > 0 || papers.length > 0;

  return (
    <div className="explorer">
      {hasResults ? (
        <div className="resource-grid">
          {books.length ? (
            <section className="resource-panel card">
              <div className="card__body">
                <p className="eyebrow">Books</p>
                <ResourceList items={books} />
              </div>
            </section>
          ) : null}

          {papers.length ? (
            <section className="resource-panel card">
              <div className="card__body">
                <p className="eyebrow">Research papers</p>
                <ResourceList items={papers} />
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState
          title="No results found"
          description="Try another search term to find a book or paper."
        />
      )}
    </div>
  );
}
