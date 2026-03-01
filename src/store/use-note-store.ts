import { SavedNoteView } from "@/lib/note-query";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Store = {
  isScrolled: boolean;
  setIsScrolled: (value: boolean) => void;
  savedViews: SavedNoteView[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  createSavedView: (view: Omit<SavedNoteView, "id" | "createdAt">) => SavedNoteView;
  deleteSavedView: (viewId: string) => void;
  markdownContent: string;
  setMarkdownContent: (value: string | ((currentValue: string) => string)) => void;
};

type PersistedStoreState = {
  savedViews?: SavedNoteView[];
  markdownContent?: string;
};

const nowISO = () => new Date().toISOString();
const DEFAULT_MARKDOWN = "## Write your note here...";

const useNoteStore = create<Store>()(
  persist(
    (set) => ({
      isScrolled: false,
      setIsScrolled: (value) => {
        set(() => ({ isScrolled: value }));
      },
      savedViews: [],
      hasHydrated: false,
      setHasHydrated: (value) => {
        set(() => ({ hasHydrated: value }));
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
      version: 3,
      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }

        const currentState = persistedState as PersistedStoreState;
        return {
          savedViews: Array.isArray(currentState.savedViews) ? currentState.savedViews : [],
          markdownContent:
            typeof currentState.markdownContent === "string"
              ? currentState.markdownContent
              : DEFAULT_MARKDOWN,
        };
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
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
