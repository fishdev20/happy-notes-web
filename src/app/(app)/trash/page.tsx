"use client";

import { NoteStatus } from "@/@types/models/Note";
import NoteListCard from "@/components/note/note-list-card";
import {
  useDeleteNoteMutation,
  useNotesQuery,
  useRestoreNoteMutation,
} from "@/hooks/use-notes-query";
import { sortByUpdatedAt } from "@/lib/note-utils";
import useNoteStore from "@/store/use-note-store";

export default function Trash() {
  const { hasHydrated } = useNoteStore();
  const { data: notes = [] } = useNotesQuery();
  const restoreMutation = useRestoreNoteMutation();
  const deleteMutation = useDeleteNoteMutation();
  const trashedNotes = sortByUpdatedAt(notes.filter((note) => note.status === NoteStatus.TRASH));

  return (
    <section className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-semibold">Trash</h1>
        <p className="text-sm text-muted-foreground">Restore notes or remove them permanently.</p>
      </div>

      {!hasHydrated ? (
        <p className="text-sm text-muted-foreground">Loading trashed notes...</p>
      ) : trashedNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Trash is empty.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trashedNotes.map((note) => (
            <NoteListCard
              key={note.id}
              note={note}
              onRestore={async (noteId) => {
                await restoreMutation.mutateAsync(noteId);
              }}
              onDelete={async (noteId) => {
                await deleteMutation.mutateAsync(noteId);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
