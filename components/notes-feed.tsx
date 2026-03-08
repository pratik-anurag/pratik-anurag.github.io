import type { NoteMeta } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";
import { NoteCard } from "@/components/note-card";

type NotesFeedProps = {
  notes: NoteMeta[];
};

export function NotesFeed({ notes }: NotesFeedProps) {
  return (
    <div className="explorer">
      {notes.length ? (
        <div className="timeline">
          {notes.map((note) => (
            <NoteCard key={note.slug} note={note} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No notes yet"
          description="Notes will appear here once they are added."
        />
      )}
    </div>
  );
}
