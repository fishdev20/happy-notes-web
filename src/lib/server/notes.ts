import Note, { NoteStatus } from "@/@types/models/Note";
import {
  Note as PrismaNote,
  NoteStatus as PrismaNoteStatus,
  Tag as PrismaTag,
} from "@prisma/client";

const statusToClientMap: Record<PrismaNoteStatus, NoteStatus> = {
  ACTIVE: NoteStatus.ACTIVE,
  ARCHIVED: NoteStatus.ARCHIVED,
  TRASH: NoteStatus.TRASH,
};

const statusFromClientMap: Record<NoteStatus, PrismaNoteStatus> = {
  [NoteStatus.ACTIVE]: PrismaNoteStatus.ACTIVE,
  [NoteStatus.ARCHIVED]: PrismaNoteStatus.ARCHIVED,
  [NoteStatus.TRASH]: PrismaNoteStatus.TRASH,
};

export const toPrismaStatus = (status: string | undefined): PrismaNoteStatus | null => {
  if (!status) {
    return null;
  }

  const normalized = status.toLowerCase();
  if (normalized === NoteStatus.ACTIVE) return PrismaNoteStatus.ACTIVE;
  if (normalized === NoteStatus.ARCHIVED) return PrismaNoteStatus.ARCHIVED;
  if (normalized === NoteStatus.TRASH) return PrismaNoteStatus.TRASH;
  return null;
};

export const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return [...new Set(tags)]
    .map((tag) => (typeof tag === "string" ? tag.trim().toLowerCase().replace(/^#/, "") : ""))
    .filter(Boolean);
};

export const serializeNote = (
  note: PrismaNote & {
    tags: Array<{
      tag: PrismaTag;
    }>;
  },
): Note => {
  return {
    id: note.id,
    title: note.title,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    content: note.body,
    tag: note.tags.map((item) => item.tag.slug),
    status: statusToClientMap[note.status],
    color: note.color ?? "#3b82f6",
  };
};

export const toPrismaStatusOrDefault = (status: string | undefined) => {
  return toPrismaStatus(status) ?? PrismaNoteStatus.ACTIVE;
};

export const fromClientStatus = (status: NoteStatus): PrismaNoteStatus => {
  return statusFromClientMap[status];
};
