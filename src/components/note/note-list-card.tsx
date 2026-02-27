"use client";

import Note, { NoteStatus } from "@/@types/models/Note";
import { buildNotePreview, formatNoteDate } from "@/lib/note-utils";
import { Archive, Loader2, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";

type NoteListCardProps = {
  note: Note;
  onArchive?: (noteId: string) => void | Promise<void>;
  onMoveToTrash?: (noteId: string) => void | Promise<void>;
  onRestore?: (noteId: string) => void | Promise<void>;
  onDelete?: (noteId: string) => void | Promise<void>;
};

export default function NoteListCard({
  note,
  onArchive,
  onMoveToTrash,
  onRestore,
  onDelete,
}: NoteListCardProps) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const runAction = async (
    actionName: "archive" | "trash" | "restore" | "delete",
    callback?: (noteId: string) => void | Promise<void>,
  ) => {
    if (!callback || pendingAction) {
      return;
    }

    setPendingAction(actionName);
    try {
      await Promise.resolve(callback(note.id));
    } finally {
      setPendingAction(null);
    }
  };

  const isBusy = Boolean(pendingAction);

  return (
    <Card
      className="gap-4 py-4 border-l-4"
      style={{
        borderLeftColor: note.color,
      }}
    >
      <CardHeader className="px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: note.color,
              }}
              aria-hidden
            />
            <CardTitle className="line-clamp-1 text-base">{note.title}</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatNoteDate(note.updatedAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {buildNotePreview(note.content)}
        </p>
        {note.tag.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {note.tag.map((tag) => (
              <span
                key={`${note.id}-${tag}`}
                className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 pt-0 flex-wrap gap-2">
        {note.status !== NoteStatus.TRASH && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/notes/${note.id}`}>
              <Pencil />
              Edit
            </Link>
          </Button>
        )}
        {note.status === NoteStatus.ACTIVE && onArchive && (
          <Button
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => runAction("archive", onArchive)}
          >
            {pendingAction === "archive" ? <Loader2 className="animate-spin" /> : <Archive />}
            {pendingAction === "archive" ? "Archiving..." : "Archive"}
          </Button>
        )}
        {note.status !== NoteStatus.TRASH && onMoveToTrash && (
          <Button
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => runAction("trash", onMoveToTrash)}
          >
            {pendingAction === "trash" ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {pendingAction === "trash" ? "Moving..." : "Trash"}
          </Button>
        )}
        {note.status === NoteStatus.ARCHIVED && onRestore && (
          <Button
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => runAction("restore", onRestore)}
          >
            {pendingAction === "restore" ? <Loader2 className="animate-spin" /> : <RotateCcw />}
            {pendingAction === "restore" ? "Restoring..." : "Restore"}
          </Button>
        )}
        {note.status === NoteStatus.TRASH && onRestore && (
          <Button
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => runAction("restore", onRestore)}
          >
            {pendingAction === "restore" ? <Loader2 className="animate-spin" /> : <RotateCcw />}
            {pendingAction === "restore" ? "Restoring..." : "Restore"}
          </Button>
        )}
        {note.status === NoteStatus.TRASH && onDelete && (
          <Button
            variant="destructive"
            size="sm"
            disabled={isBusy}
            onClick={() => runAction("delete", onDelete)}
          >
            {pendingAction === "delete" ? <Loader2 className="animate-spin" /> : <X />}
            {pendingAction === "delete" ? "Deleting..." : "Delete forever"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
