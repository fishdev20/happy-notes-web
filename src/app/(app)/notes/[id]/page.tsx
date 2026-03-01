"use client";

import { NoteLayout } from "@/@types/models/Note";
import Chatbot from "@/components/note/chat-bot";
import ExportNoteMenu from "@/components/note/export-note-menu";
import InsertToolbar from "@/components/note/insert-toolbar";
import NoteDiff from "@/components/note/note-diff";
import NoteEditor from "@/components/note/note-editor";
import NotePreview from "@/components/note/note-preview";
import {
  useArchiveNoteMutation,
  useMoveToTrashMutation,
  useNotesQuery,
  useUpdateNoteMutation,
} from "@/hooks/use-notes-query";
import { parseTagInput } from "@/lib/note-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useLayoutStore from "@/store/use-layout-store";
import useNoteStore from "@/store/use-note-store";
import { Archive, Code, Columns2, Eye, Loader2, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const toggleItems = [
  {
    value: NoteLayout.SOURCE,
    icon: <Code />,
    label: "Editor Mode",
  },
  {
    value: NoteLayout.DIFF,
    icon: <Columns2 />,
    label: "Diff Mode",
  },
  {
    value: NoteLayout.PREVIEW,
    icon: <Eye />,
    label: "Preview Mode",
  },
];

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const noteId = params.id;
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const { markdownContent, setMarkdownContent } = useNoteStore();
  const { data: notes = [], isLoading } = useNotesQuery();
  const updateMutation = useUpdateNoteMutation();
  const archiveMutation = useArchiveNoteMutation();
  const trashMutation = useMoveToTrashMutation();
  const { activeNoteLayout, setActiveNoteLayout } = useLayoutStore();

  const currentNote = useMemo(() => notes.find((note) => note.id === noteId), [notes, noteId]);
  const parsedTags = useMemo(() => parseTagInput(tagInput), [tagInput]);
  const isSaving = updateMutation.isPending;
  const isArchiving = archiveMutation.isPending;
  const isTrashing = trashMutation.isPending;

  useEffect(() => {
    if (!currentNote) {
      return;
    }

    const nextTagInput = currentNote.tag.join(", ");
    const shouldSync =
      title !== currentNote.title ||
      tagInput !== nextTagInput ||
      markdownContent !== currentNote.content;

    if (!shouldSync) {
      return;
    }

    setTitle(currentNote.title);
    setTagInput(nextTagInput);
    setMarkdownContent(currentNote.content);
  }, [currentNote, markdownContent, setMarkdownContent, tagInput, title]);

  const handleLayoutChange = (layout: NoteLayout | string) => {
    if (
      layout === NoteLayout.SOURCE ||
      layout === NoteLayout.DIFF ||
      layout === NoteLayout.PREVIEW
    ) {
      setActiveNoteLayout(layout);
    }
  };

  const handleSave = () => {
    if (!currentNote || isSaving || isArchiving || isTrashing) {
      return;
    }

    updateMutation.mutate({
      noteId: currentNote.id,
      updates: {
        title,
        content: markdownContent,
        tag: parsedTags,
      },
    });
  };

  const handleArchive = () => {
    if (!currentNote || isSaving || isArchiving || isTrashing) {
      return;
    }

    archiveMutation
      .mutateAsync(currentNote.id)
      .then(() => router.push("/archive"))
      .catch((error) => console.error(error));
  };

  const handleMoveToTrash = () => {
    if (!currentNote || isSaving || isArchiving || isTrashing) {
      return;
    }

    trashMutation
      .mutateAsync(currentNote.id)
      .then(() => router.push("/trash"))
      .catch((error) => console.error(error));
  };

  const handleInsertSnippet = (snippet: string) => {
    setMarkdownContent((currentValue) => {
      const normalized = currentValue.trim();
      if (!normalized) {
        return snippet;
      }
      return `${normalized}\n\n${snippet}`;
    });
  };

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading note...</p>;
  }

  if (!currentNote) {
    return (
      <div className="p-4 space-y-2">
        <h1 className="text-lg font-semibold">Note not found</h1>
        <p className="text-sm text-muted-foreground">
          This note may have been deleted. Open all notes to create a new one.
        </p>
        <Button onClick={() => router.push("/notes")}>Go to notes</Button>
      </div>
    );
  }

  const hasTitleChanged = title.trim() !== currentNote.title.trim();
  const hasContentChanged = markdownContent !== currentNote.content;
  const hasTagsChanged =
    parsedTags.length !== currentNote.tag.length ||
    parsedTags.some((tag, index) => tag !== currentNote.tag[index]);
  const hasChanges = hasTitleChanged || hasContentChanged || hasTagsChanged;

  return (
    <div className="flex flex-col gap-4 h-full min-h-[calc(100svh-4rem-4rem)] relative">
      <div className="sticky top-0 z-10 overflow-x-auto rounded-md border bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex min-w-max items-center gap-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title"
            className="w-56"
          />
          <Input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            placeholder="Tags: meeting, work"
            className="w-52"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleArchive}
                disabled={isSaving || isArchiving || isTrashing}
                aria-label="Archive note"
              >
                {isArchiving ? <Loader2 className="animate-spin" /> : <Archive />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isArchiving ? "Archiving..." : "Archive"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleMoveToTrash}
                disabled={isSaving || isArchiving || isTrashing}
                aria-label="Move note to trash"
              >
                {isTrashing ? <Loader2 className="animate-spin" /> : <Trash2 />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isTrashing ? "Moving..." : "Trash"}</TooltipContent>
          </Tooltip>
          <Button
            onClick={handleSave}
            disabled={isSaving || isArchiving || isTrashing || !hasChanges}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <ExportNoteMenu title={title || currentNote.title} markdown={markdownContent} />
          <TooltipProvider>
            <ToggleGroup
              type="single"
              value={activeNoteLayout}
              onValueChange={handleLayoutChange}
              className="gap-1"
            >
              {toggleItems.map(({ value, icon, label }) => (
                <Tooltip key={value}>
                  <TooltipTrigger asChild>
                    <div>
                      <ToggleGroupItem value={value} aria-label={label}>
                        {icon}
                      </ToggleGroupItem>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </TooltipProvider>
          {(activeNoteLayout === NoteLayout.SOURCE || activeNoteLayout === NoteLayout.DIFF) && (
            <InsertToolbar onInsert={handleInsertSnippet} />
          )}
        </div>
      </div>
      {activeNoteLayout === NoteLayout.SOURCE && (
        <NoteEditor value={markdownContent} onChange={setMarkdownContent} />
      )}
      {activeNoteLayout === NoteLayout.DIFF && (
        <NoteDiff value={markdownContent} onChange={setMarkdownContent} />
      )}
      {activeNoteLayout === NoteLayout.PREVIEW && <NotePreview markdownContent={markdownContent} />}
      <Chatbot />
    </div>
  );
}
