import type { ReadingItem } from "@/lib/types";
import { googleSearchUrl } from "@/lib/utils";

type ResourceListProps = {
  items: ReadingItem[];
};

export function ResourceList({ items }: ResourceListProps) {
  return (
    <ul className="resource-list">
      {items.map((item) => (
        <li key={item.slug} className="resource-list__item">
          <a
            href={googleSearchUrl(item.searchQuery || item.title)}
            target="_blank"
            rel="noreferrer"
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
