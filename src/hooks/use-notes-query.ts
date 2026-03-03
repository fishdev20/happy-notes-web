"use client";

import Note, { NoteStatus } from "@/@types/models/Note";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import useToastStore from "@/store/use-toast-store";

type NotesResponse = {
  notes: Note[];
};

type NoteResponse = {
  note: Note;
};

const NOTES_QUERY_KEY = ["notes"] as const;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Request failed";
};

async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? "Request failed");
  }

  return (await response.json()) as T;
}

export const useNotesQuery = () => {
  const pushToast = useToastStore((state) => state.pushToast);
  const query = useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: async () => {
      const payload = await apiRequest<NotesResponse>("/api/notes");
      return payload.notes;
    },
    retry: 1,
  });

  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!query.isError) {
      lastErrorRef.current = null;
      return;
    }

    const message = getErrorMessage(query.error);
    if (lastErrorRef.current === message) {
      return;
    }

    lastErrorRef.current = message;
    pushToast({
      title: "Failed to load notes",
      description: message,
      variant: "error",
    });
  }, [query.error, query.isError, pushToast]);

  return query;
};

export const useCreateNoteMutation = () => {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.pushToast);

  return useMutation({
    mutationFn: async (newNote: { title: string; content: string; tag?: string[] }) => {
      const payload = await apiRequest<NoteResponse>("/api/notes", {
        method: "POST",
        body: JSON.stringify(newNote),
      });
      return payload.note;
    },
    onSuccess: (createdNote) => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (current) => {
        if (!current) {
          return [createdNote];
        }
        return [createdNote, ...current.filter((note) => note.id !== createdNote.id)];
      });
      pushToast({
        title: "Note created",
        description: createdNote.title,
        variant: "success",
      });
    },
    onError: (error) => {
      pushToast({
        title: "Failed to create note",
        description: getErrorMessage(error),
        variant: "error",
      });
    },
  });
};

export const useUpdateNoteMutation = () => {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.pushToast);

  return useMutation({
    mutationFn: async ({
      noteId,
      updates,
      showSuccessToast = true,
    }: {
      noteId: string;
      updates: Partial<Pick<Note, "title" | "content" | "tag" | "status" | "color">>;
      showSuccessToast?: boolean;
    }) => {
      const payload = await apiRequest<NoteResponse>(`/api/notes/${noteId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      return { note: payload.note, showSuccessToast };
    },
    onSuccess: ({ note: updatedNote, showSuccessToast }) => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (current) =>
        (current ?? []).map((note) => (note.id === updatedNote.id ? updatedNote : note)),
      );
      if (showSuccessToast) {
        pushToast({
          title: "Note saved",
          description: updatedNote.title,
          variant: "success",
        });
      }
    },
    onError: (error) => {
      pushToast({
        title: "Failed to save note",
        description: getErrorMessage(error),
        variant: "error",
      });
    },
  });
};

export const useArchiveNoteMutation = () => {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.pushToast);

  return useMutation({
    mutationFn: async (noteId: string) => {
      const payload = await apiRequest<NoteResponse>(`/api/notes/${noteId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: NoteStatus.ARCHIVED,
        }),
      });
      return payload.note;
    },
    onSuccess: (updatedNote) => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (current) =>
        (current ?? []).map((note) => (note.id === updatedNote.id ? updatedNote : note)),
      );
      pushToast({
        title: "Note archived",
        description: updatedNote.title,
        variant: "success",
      });
    },
    onError: (error) => {
      pushToast({
        title: "Failed to archive note",
        description: getErrorMessage(error),
        variant: "error",
      });
    },
  });
};

export const useMoveToTrashMutation = () => {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.pushToast);

  return useMutation({
    mutationFn: async (noteId: string) => {
      const payload = await apiRequest<NoteResponse>(`/api/notes/${noteId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: NoteStatus.TRASH,
        }),
      });
      return payload.note;
    },
    onSuccess: (updatedNote) => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (current) =>
        (current ?? []).map((note) => (note.id === updatedNote.id ? updatedNote : note)),
      );
      pushToast({
        title: "Moved to trash",
        description: updatedNote.title,
        variant: "success",
      });
    },
    onError: (error) => {
      pushToast({
        title: "Failed to move note",
        description: getErrorMessage(error),
        variant: "error",
      });
    },
  });
};

export const useRestoreNoteMutation = () => {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.pushToast);

  return useMutation({
    mutationFn: async (noteId: string) => {
      const payload = await apiRequest<NoteResponse>(`/api/notes/${noteId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: NoteStatus.ACTIVE,
        }),
      });
      return payload.note;
    },
    onSuccess: (updatedNote) => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (current) =>
        (current ?? []).map((note) => (note.id === updatedNote.id ? updatedNote : note)),
      );
      pushToast({
        title: "Note restored",
        description: updatedNote.title,
        variant: "success",
      });
    },
    onError: (error) => {
      pushToast({
        title: "Failed to restore note",
        description: getErrorMessage(error),
        variant: "error",
      });
    },
  });
};

export const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.pushToast);

  return useMutation({
    mutationFn: async (noteId: string) => {
      await apiRequest<{ success: boolean }>(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      return noteId;
    },
    onSuccess: (noteId) => {
      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (current) =>
        (current ?? []).filter((note) => note.id !== noteId),
      );
      pushToast({
        title: "Note deleted",
        description: "The note was removed permanently.",
        variant: "success",
      });
    },
    onError: (error) => {
      pushToast({
        title: "Failed to delete note",
        description: getErrorMessage(error),
        variant: "error",
      });
    },
  });
};
