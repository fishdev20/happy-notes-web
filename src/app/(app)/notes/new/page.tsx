"use client";

import Note, { NoteLayout } from "@/@types/models/Note";
import Chatbot from "@/components/note/chat-bot";
import ExportNoteMenu from "@/components/note/export-note-menu";
import InsertToolbar from "@/components/note/insert-toolbar";
import NoteDiff from "@/components/note/note-diff";
import NoteEditor from "@/components/note/note-editor";
import NotePreview from "@/components/note/note-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { parseTagInput } from "@/lib/note-query";
import useLayoutStore from "@/store/use-layout-store";
import useNoteStore from "@/store/use-note-store";
import { useQueryClient } from "@tanstack/react-query";
import { Code, Columns2, Eye, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
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

const DEFAULT_MARKDOWN = "## Write your note here...";

export default function AddNote() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Untitled note");
  const [tagInput, setTagInput] = useState("");
  const { markdownContent, setMarkdownContent, createNote } = useNoteStore();
  const [isSaving, setIsSaving] = useState(false);
  const { activeNoteLayout, setActiveNoteLayout } = useLayoutStore();

  useEffect(() => {
    setMarkdownContent(DEFAULT_MARKDOWN);
  }, [setMarkdownContent]);

  const canSave = useMemo(
    () => title.trim().length > 0 || markdownContent.trim().length > 0,
    [markdownContent, title],
  );

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
    if (!canSave || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const created = createNote({
        title,
        content: markdownContent,
        tag: parseTagInput(tagInput),
      });
      queryClient.setQueryData<Note[]>(["notes"], useNoteStore.getState().notes);
      router.replace(`/notes/${created.id}`);
    } catch (error) {
      console.error(error);
      setIsSaving(false);
    }
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

  return (
    <div className="flex flex-col gap-4 h-full min-h-[calc(100svh-4rem-4rem)] relative">
      <div className="sticky top-0 z-10 overflow-x-auto border bg-background/70 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <Button onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <ExportNoteMenu title={title} markdown={markdownContent} />
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
