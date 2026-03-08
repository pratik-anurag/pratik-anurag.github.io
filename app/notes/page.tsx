import { NotesFeed } from "@/components/notes-feed";
import { PageHero } from "@/components/page-hero";
import { createMetadata } from "@/lib/site";
import { getAllNotes } from "@/lib/content";

export const metadata = createMetadata({
  title: "Learning Notes",
  description: "Short-form notes on backend concepts, databases, system design, and DevOps learnings.",
  path: "/notes"
});

export default function NotesPage() {
  return (
    <>
      <PageHero
        eyebrow="Learning / Notes"
        title="small configs/dot files"
        description="Shorter entries for database notes, system design patterns, tooling reminders, and practical operational checklists."
      />

      <section className="section">
        <div className="container">
          <NotesFeed notes={getAllNotes()} />
        </div>
      </section>
    </>
  );
}
