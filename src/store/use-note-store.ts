import Note, { NoteLayout } from "@/@types/models/Note";
import { create } from "zustand";

type Store = {
  isScrolled: boolean;
  activeNoteLayout: NoteLayout;
  setIsScrolled: (value: boolean) => void;
  setActiveNoteLayout: (value: NoteLayout) => void;
  notes: Note[];
  getNotes: () => void;
  addNote: (newNote: Note) => void;
  updateNote: (newNote: Note) => void;
  deleteNote: (noteId: string) => void;
  markdownContent: string;
  setMarkdownContent: (value: string) => void;
};

const useNoteStore = create<Store>()((set) => ({
  isScrolled: false,
  activeNoteLayout: NoteLayout.DIFF,
  setIsScrolled: (value) => {
    set(() => ({ isScrolled: value }));
  },
  setActiveNoteLayout: (value: NoteLayout) => {
    set(() => ({ activeNoteLayout: value }));
  },
  notes: [],
  getNotes: () => {
    set(() => ({ notes: [] }));
  },
  addNote: (newNote: Note) => {
    set(() => ({ notes: [] }));
  },
  updateNote: (newNote: Note) => {
    set(() => ({ notes: [] }));
  },
  deleteNote: (noteId: string) => {
    set(() => ({ notes: [] }));
  },
  markdownContent: "## Write your note here...",
  setMarkdownContent: (value) => {
    set(() => ({ markdownContent: value }));
  },
}));

export default useNoteStore;
