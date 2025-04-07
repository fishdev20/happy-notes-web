"use client";
import { NoteLayout } from "@/@types/models/Note";
import NoteDiff from "@/components/note/note-diff";
import NoteEditor from "@/components/note/note-editor";
import NotePreview from "@/components/note/note-preview";
import useNoteStore from "@/store/use-note-store";
import { useEffect } from "react";

export default function AddNote() {
  const { isScrolled, activeNoteLayout, setActiveNoteLayout, markdownContent, setMarkdownContent } =
    useNoteStore();

  useEffect(() => {
    setActiveNoteLayout(NoteLayout.DIFF);
  }, []);

  const handleChange = (value: string) => {
    setMarkdownContent(value);
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-[calc(100svh-4rem-4rem)] relative">
      {activeNoteLayout === NoteLayout.SOURCE && (
        <NoteEditor value={markdownContent} onChange={handleChange} />
      )}
      {activeNoteLayout === NoteLayout.DIFF && (
        <NoteDiff value={markdownContent} onChange={handleChange} />
      )}
      {activeNoteLayout === NoteLayout.PREVIEW && <NotePreview markdownContent={markdownContent} />}
    </div>
  );
}
