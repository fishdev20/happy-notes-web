import Note, { NoteStatus } from "@/@types/models/Note";

export type NoteSortField = "updatedAt" | "createdAt";
export type NoteSortDirection = "desc" | "asc";

export type NoteSearchFilters = {
  query: string;
  tags: string[];
  status: NoteStatus;
  updatedWithinDays: number | null;
};

export type SavedNoteView = {
  id: string;
  name: string;
  filters: NoteSearchFilters;
  sortField: NoteSortField;
  sortDirection: NoteSortDirection;
  pageSize: number;
  createdAt: string;
};

const normalize = (value: string) => value.trim().toLowerCase();

const getSortValue = (note: Note, field: NoteSortField) => note[field];

const daysAgo = (days: number) => Date.now() - days * 24 * 60 * 60 * 1000;

export const normalizeTag = (value: string) => normalize(value).replace(/^#/, "");

export const parseTagInput = (value: string) =>
  value
    .split(",")
    .map((tag) => normalizeTag(tag))
    .filter(Boolean);

export const collectTags = (notes: Note[]) =>
  [...new Set(notes.flatMap((note) => note.tag).map((tag) => normalizeTag(tag)))].sort();

export const filterNotes = (notes: Note[], filters: NoteSearchFilters) => {
  const normalizedQuery = normalize(filters.query);
  const normalizedTags = filters.tags.map(normalizeTag);
  const updatedCutoff = filters.updatedWithinDays ? daysAgo(filters.updatedWithinDays) : null;

  return notes.filter((note) => {
    if (note.status !== filters.status) {
      return false;
    }

    if (updatedCutoff && new Date(note.updatedAt).getTime() < updatedCutoff) {
      return false;
    }

    if (normalizedTags.length > 0) {
      const noteTags = note.tag.map(normalizeTag);
      const containsAllTags = normalizedTags.every((tag) => noteTags.includes(tag));
      if (!containsAllTags) {
        return false;
      }
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = `${note.title} ${note.content} ${note.tag.join(" ")}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
};

export const sortNotes = (
  notes: Note[],
  sortField: NoteSortField,
  sortDirection: NoteSortDirection,
) => {
  const direction = sortDirection === "asc" ? 1 : -1;
  return [...notes].sort((a, b) => {
    const first = new Date(getSortValue(a, sortField)).getTime();
    const second = new Date(getSortValue(b, sortField)).getTime();
    if (first === second) {
      return a.id.localeCompare(b.id) * direction;
    }
    return (first - second) * direction;
  });
};

const encodeCursor = (sortValue: string, id: string) => `${sortValue}::${id}`;

const decodeCursor = (cursor: string | null) => {
  if (!cursor) {
    return null;
  }
  const [sortValue, id] = cursor.split("::");
  if (!sortValue || !id) {
    return null;
  }
  return { sortValue, id };
};

export const paginateNotes = (
  sortedNotes: Note[],
  pageSize: number,
  sortField: NoteSortField,
  cursor: string | null,
) => {
  const pageLimit = Math.max(1, pageSize);
  const decoded = decodeCursor(cursor);

  let startIndex = 0;
  if (decoded) {
    const foundIndex = sortedNotes.findIndex(
      (note) => note.id === decoded.id && getSortValue(note, sortField) === decoded.sortValue,
    );
    startIndex = foundIndex >= 0 ? foundIndex + 1 : 0;
  }

  const items = sortedNotes.slice(startIndex, startIndex + pageLimit);
  const lastItem = items[items.length - 1];
  const hasNextPage = startIndex + pageLimit < sortedNotes.length;

  return {
    items,
    nextCursor:
      hasNextPage && lastItem ? encodeCursor(getSortValue(lastItem, sortField), lastItem.id) : null,
    hasNextPage,
  };
};
