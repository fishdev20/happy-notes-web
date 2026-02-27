import Note, { NoteLayout, NoteStatus } from "@/@types/models/Note";
import { getRandomNoteColor } from "@/lib/note-color";
import { SavedNoteView } from "@/lib/note-query";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Store = {
  isScrolled: boolean;
  activeNoteLayout: NoteLayout;
  setIsScrolled: (value: boolean) => void;
  setActiveNoteLayout: (value: NoteLayout) => void;
  notes: Note[];
  savedViews: SavedNoteView[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  getNotes: () => Note[];
  getNoteById: (noteId: string) => Note | undefined;
  createNote: (newNote: { title: string; content: string; tag?: string[] }) => Note;
  updateNote: (noteId: string, updates: Partial<Pick<Note, "title" | "content" | "tag">>) => void;
  archiveNote: (noteId: string) => void;
  moveToTrash: (noteId: string) => void;
  restoreNote: (noteId: string) => void;
  deleteNote: (noteId: string) => void;
  createSavedView: (view: Omit<SavedNoteView, "id" | "createdAt">) => SavedNoteView;
  deleteSavedView: (viewId: string) => void;
  markdownContent: string;
  setMarkdownContent: (value: string | ((currentValue: string) => string)) => void;
};

type PersistedStoreState = {
  notes?: Note[];
  savedViews?: SavedNoteView[];
  markdownContent?: string;
};

const nowISO = () => new Date().toISOString();
const DEFAULT_MARKDOWN = "## Write your note here...";

const updateNoteById = (notes: Note[], noteId: string, updater: (note: Note) => Note) =>
  notes.map((note) => (note.id === noteId ? updater(note) : note));

const useNoteStore = create<Store>()(
  persist(
    (set, get) => ({
      isScrolled: false,
      activeNoteLayout: NoteLayout.DIFF,
      setIsScrolled: (value) => {
        set(() => ({ isScrolled: value }));
      },
      setActiveNoteLayout: (value: NoteLayout) => {
        set(() => ({ activeNoteLayout: value }));
      },
      notes: [],
      savedViews: [],
      hasHydrated: false,
      setHasHydrated: (value) => {
        set(() => ({ hasHydrated: value }));
      },
      getNotes: () => get().notes,
      getNoteById: (noteId) => get().notes.find((note) => note.id === noteId),
      createNote: ({ title, content, tag = [] }) => {
        const timestamp = nowISO();
        const note: Note = {
          id: crypto.randomUUID(),
          title: title.trim() || "Untitled note",
          content,
          tag,
          createdAt: timestamp,
          updatedAt: timestamp,
          status: NoteStatus.ACTIVE,
          color: getRandomNoteColor(),
        };

        set((state) => ({ notes: [note, ...state.notes] }));
        return note;
      },
      updateNote: (noteId, updates) => {
        set((state) => ({
          notes: updateNoteById(state.notes, noteId, (note) => ({
            ...note,
            ...updates,
            title:
              typeof updates.title === "string"
                ? updates.title.trim() || "Untitled note"
                : note.title,
            updatedAt: nowISO(),
          })),
        }));
      },
      archiveNote: (noteId) => {
        set((state) => ({
          notes: updateNoteById(state.notes, noteId, (note) => ({
            ...note,
            status: NoteStatus.ARCHIVED,
            updatedAt: nowISO(),
          })),
        }));
      },
      moveToTrash: (noteId) => {
        set((state) => ({
          notes: updateNoteById(state.notes, noteId, (note) => ({
            ...note,
            status: NoteStatus.TRASH,
            updatedAt: nowISO(),
          })),
        }));
      },
      restoreNote: (noteId) => {
        set((state) => ({
          notes: updateNoteById(state.notes, noteId, (note) => ({
            ...note,
            status: NoteStatus.ACTIVE,
            updatedAt: nowISO(),
          })),
        }));
      },
      deleteNote: (noteId) => {
        set((state) => ({ notes: state.notes.filter((note) => note.id !== noteId) }));
      },
      createSavedView: (view) => {
        const savedView: SavedNoteView = {
          ...view,
          id: crypto.randomUUID(),
          createdAt: nowISO(),
        };
        set((state) => ({ savedViews: [savedView, ...state.savedViews] }));
        return savedView;
      },
      deleteSavedView: (viewId) => {
        set((state) => ({ savedViews: state.savedViews.filter((view) => view.id !== viewId) }));
      },
      markdownContent: DEFAULT_MARKDOWN,
      setMarkdownContent: (value) => {
        set((state) => ({
          markdownContent: typeof value === "function" ? value(state.markdownContent) : value,
        }));
      },
    }),
    {
      name: "happy-notes-store",
      version: 2,
      migrate: (persistedState: unknown, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }

        const currentState = persistedState as PersistedStoreState;

        if (version < 2 && Array.isArray(currentState.notes)) {
          currentState.notes = currentState.notes.map((note) => ({
            ...note,
            color: typeof note.color === "string" && note.color ? note.color : getRandomNoteColor(),
          }));
        }

        return currentState;
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notes: state.notes,
        savedViews: state.savedViews,
        markdownContent: state.markdownContent,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useNoteStore;
