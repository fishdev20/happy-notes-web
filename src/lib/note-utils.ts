import Note from "@/@types/models/Note";

const PREVIEW_LENGTH = 140;

export const buildNotePreview = (content: string) => {
  const normalizedContent = content.replace(/\s+/g, " ").trim();
  if (normalizedContent.length <= PREVIEW_LENGTH) {
    return normalizedContent || "No content yet.";
  }

  return `${normalizedContent.slice(0, PREVIEW_LENGTH)}...`;
};

export const sortByUpdatedAt = (notes: Note[]) =>
  [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

export const formatNoteDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
