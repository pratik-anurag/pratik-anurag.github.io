import Link from "next/link";
import type { NoteMeta } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type NoteCardProps = {
  note: NoteMeta;
};

export function NoteCard({ note }: NoteCardProps) {
  return (
    <article className="card note-card">
      <div className="card__body">
        <div className="card__meta">
          <span>{formatDate(note.publishedAt)}</span>
          <span>{note.readingTime}</span>
        </div>
        <h3>
          <Link href={`/notes/${note.slug}`}>{note.title}</Link>
        </h3>
        <p className="muted">{note.description}</p>
      </div>
    </article>
  );
}
