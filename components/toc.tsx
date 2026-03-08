import type { MarkdownHeading } from "@/lib/types";

type TocProps = {
  headings: MarkdownHeading[];
};

export function TableOfContents({ headings }: TocProps) {
  if (!headings.length) {
    return null;
  }

  return (
    <aside className="toc card">
      <div className="card__body">
        <p className="eyebrow">On this page</p>
        <ul className="toc__list">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={heading.level === 3 ? "toc__item toc__item--nested" : "toc__item"}
            >
              <a href={`#${heading.id}`}>{heading.text}</a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
