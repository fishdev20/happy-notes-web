"use client";

import { NoteStatus } from "@/@types/models/Note";
import NoteListCard from "@/components/note/note-list-card";
import {
  useMoveToTrashMutation,
  useNotesQuery,
  useRestoreNoteMutation,
} from "@/hooks/use-notes-query";
import { sortByUpdatedAt } from "@/lib/note-utils";
import useNoteStore from "@/store/use-note-store";

export default function Archive() {
  const { hasHydrated } = useNoteStore();
  const { data: notes = [] } = useNotesQuery();
  const restoreMutation = useRestoreNoteMutation();
  const trashMutation = useMoveToTrashMutation();
  const archivedNotes = sortByUpdatedAt(
    notes.filter((note) => note.status === NoteStatus.ARCHIVED),
  );

  return (
    <section className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-semibold">Archive</h1>
        <p className="text-sm text-muted-foreground">
          Notes you want to keep but not actively edit.
        </p>
      </div>

      {!hasHydrated ? (
        <p className="text-sm text-muted-foreground">Loading archived notes...</p>
      ) : archivedNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No archived notes yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {archivedNotes.map((note) => (
            <NoteListCard
              key={note.id}
              note={note}
              onRestore={async (noteId) => {
                await restoreMutation.mutateAsync(noteId);
              }}
              onMoveToTrash={async (noteId) => {
                await trashMutation.mutateAsync(noteId);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
