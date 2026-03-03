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
import { useEffect, useMemo, useRef, useState } from "react";

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
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedNoteVersionRef = useRef<string | null>(null);
  const lastPersistedDraftKeyRef = useRef<string | null>(null);

  const normalizedTitle = title.trim() || "Untitled note";
  const localDraftKey = `${normalizedTitle}::${markdownContent}::${parsedTags.join(",")}`;
  const currentNoteDraftKey = currentNote
    ? `${currentNote.title.trim() || "Untitled note"}::${currentNote.content}::${currentNote.tag.join(",")}`
    : null;

  useEffect(() => {
    if (!currentNote) {
      return;
    }

    if (lastPersistedDraftKeyRef.current === null) {
      lastPersistedDraftKeyRef.current = currentNoteDraftKey;
    }

    const noteVersion = `${currentNote.id}:${currentNote.updatedAt}`;
    if (lastSyncedNoteVersionRef.current === noteVersion) {
      return;
    }

    // Ignore stale server echoes while user has newer unsaved edits locally.
    const hasLocalUnsavedChanges =
      localDraftKey !== (lastPersistedDraftKeyRef.current ?? currentNoteDraftKey);
    if (hasLocalUnsavedChanges && currentNoteDraftKey !== localDraftKey) {
      return;
    }

    lastSyncedNoteVersionRef.current = noteVersion;
    const nextTagInput = currentNote.tag.join(", ");
    setTitle(currentNote.title);
    setTagInput(nextTagInput);
    setMarkdownContent(currentNote.content);
    lastPersistedDraftKeyRef.current = currentNoteDraftKey;
  }, [currentNote, currentNoteDraftKey, localDraftKey, setMarkdownContent]);

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
      showSuccessToast: true,
    });
    lastPersistedDraftKeyRef.current = localDraftKey;
  };

  const hasTitleChanged = currentNote ? normalizedTitle !== currentNote.title.trim() : false;
  const hasContentChanged = currentNote ? markdownContent !== currentNote.content : false;
  const hasTagsChanged = currentNote
    ? parsedTags.length !== currentNote.tag.length ||
      parsedTags.some((tag, index) => tag !== currentNote.tag[index])
    : false;
  const hasChanges = hasTitleChanged || hasContentChanged || hasTagsChanged;

  useEffect(() => {
    if (!currentNote || !hasChanges || isArchiving || isTrashing || updateMutation.isPending) {
      return;
    }

    if (localDraftKey === lastPersistedDraftKeyRef.current) {
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      const draftKeyAtSaveStart = localDraftKey;
      updateMutation
        .mutateAsync({
          noteId: currentNote.id,
          updates: {
            title: normalizedTitle,
            content: markdownContent,
            tag: parsedTags,
          },
          showSuccessToast: false,
        })
        .then(() => {
          if (draftKeyAtSaveStart === localDraftKey) {
            lastPersistedDraftKeyRef.current = draftKeyAtSaveStart;
          }
        })
        .catch((error) => console.error(error));
    }, 1200);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [
    currentNote,
    hasChanges,
    isArchiving,
    isTrashing,
    localDraftKey,
    markdownContent,
    normalizedTitle,
    parsedTags,
    title,
    updateMutation,
  ]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

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

  return (
    <div className="flex flex-col gap-4 h-full min-h-[calc(100svh-4rem-4rem)] relative">
      <div className="sticky top-0 z-10 overflow-x-auto rounded-md border bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col gap-2">
          <div className="flex min-w-max items-center gap-2">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Note title"
              className="h-9 w-44"
            />
            <Input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="Tags: meeting, work"
              className="h-9 w-44"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
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
                  className="shrink-0"
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
              className="shrink-0"
              onClick={handleSave}
              disabled={isSaving || isArchiving || isTrashing || !hasChanges}
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <div className="shrink-0">
              <ExportNoteMenu
                title={title || currentNote.title}
                markdown={markdownContent}
                iconOnlyOnMobile
              />
            </div>
            <TooltipProvider>
              <ToggleGroup
                type="single"
                value={activeNoteLayout}
                onValueChange={handleLayoutChange}
                className="gap-1 shrink-0"
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
          </div>
          {(activeNoteLayout === NoteLayout.SOURCE || activeNoteLayout === NoteLayout.DIFF) && (
            <InsertToolbar onInsert={handleInsertSnippet} className="w-full" />
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
