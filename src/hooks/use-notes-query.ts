"use client";

import Note from "@/@types/models/Note";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useNoteStore from "@/store/use-note-store";

const NOTES_QUERY_KEY = ["notes"];

const getStoreNotes = () => useNoteStore.getState().notes;

export const useNotesQuery = () => {
  const hasHydrated = useNoteStore((state) => state.hasHydrated);

  return useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: async () => getStoreNotes(),
    enabled: hasHydrated,
    initialData: hasHydrated ? getStoreNotes() : undefined,
  });
};

export const useCreateNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newNote: { title: string; content: string; tag?: string[] }) =>
      useNoteStore.getState().createNote(newNote),
    onSuccess: () => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, getStoreNotes());
    },
  });
};

export const useUpdateNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      updates,
    }: {
      noteId: string;
      updates: Partial<Pick<Note, "title" | "content" | "tag">>;
    }) => {
      useNoteStore.getState().updateNote(noteId, updates);
      return noteId;
    },
    onSuccess: () => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, getStoreNotes());
    },
  });
};

export const useArchiveNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      useNoteStore.getState().archiveNote(noteId);
      return noteId;
    },
    onSuccess: () => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, getStoreNotes());
    },
  });
};

export const useMoveToTrashMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      useNoteStore.getState().moveToTrash(noteId);
      return noteId;
    },
    onSuccess: () => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, getStoreNotes());
    },
  });
};

export const useRestoreNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      useNoteStore.getState().restoreNote(noteId);
      return noteId;
    },
    onSuccess: () => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, getStoreNotes());
    },
  });
};

export const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      useNoteStore.getState().deleteNote(noteId);
      return noteId;
    },
    onSuccess: () => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, getStoreNotes());
    },
  });
};
