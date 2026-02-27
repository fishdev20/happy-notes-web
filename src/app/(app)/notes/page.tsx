"use client";

import { NoteStatus } from "@/@types/models/Note";
import AddNoteCard from "@/components/add-note-card";
import NoteListCard from "@/components/note/note-list-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NoteSortDirection,
  NoteSortField,
  collectTags,
  filterNotes,
  paginateNotes,
  sortNotes,
} from "@/lib/note-query";
import {
  useArchiveNoteMutation,
  useMoveToTrashMutation,
  useNotesQuery,
} from "@/hooks/use-notes-query";
import useNoteStore from "@/store/use-note-store";
import { useEffect, useMemo, useState } from "react";

const updatedWithinDaysOptions = [
  { label: "Any time", value: "all" },
  { label: "Last 1 day", value: "1" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
];

export default function Notes() {
  const { savedViews, hasHydrated, createSavedView, deleteSavedView } = useNoteStore();
  const { data: notes = [], isLoading } = useNotesQuery();
  const archiveMutation = useArchiveNoteMutation();
  const trashMutation = useMoveToTrashMutation();

  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortField, setSortField] = useState<NoteSortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<NoteSortDirection>("desc");
  const [updatedWithinDays, setUpdatedWithinDays] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(12);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [visibleNotes, setVisibleNotes] = useState<typeof notes>([]);
  const [viewName, setViewName] = useState("");
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  const activeNotes = useMemo(
    () => notes.filter((note) => note.status === NoteStatus.ACTIVE),
    [notes],
  );
  const allTags = useMemo(() => collectTags(activeNotes), [activeNotes]);

  const filteredSortedNotes = useMemo(
    () =>
      sortNotes(
        filterNotes(activeNotes, {
          query,
          tags: selectedTags,
          status: NoteStatus.ACTIVE,
          updatedWithinDays,
        }),
        sortField,
        sortDirection,
      ),
    [activeNotes, query, selectedTags, sortDirection, sortField, updatedWithinDays],
  );

  useEffect(() => {
    const firstPage = paginateNotes(filteredSortedNotes, pageSize, sortField, null);
    setVisibleNotes(firstPage.items);
    setCursor(firstPage.nextCursor);
    setHasNextPage(firstPage.hasNextPage);
  }, [filteredSortedNotes, pageSize, sortField]);

  const toggleTag = (tag: string) => {
    setActiveViewId(null);
    setSelectedTags((previous) =>
      previous.includes(tag) ? previous.filter((current) => current !== tag) : [...previous, tag],
    );
  };

  const loadMore = () => {
    const nextPage = paginateNotes(filteredSortedNotes, pageSize, sortField, cursor);
    setVisibleNotes((previous) => {
      const known = new Set(previous.map((note) => note.id));
      return [...previous, ...nextPage.items.filter((note) => !known.has(note.id))];
    });
    setCursor(nextPage.nextCursor);
    setHasNextPage(nextPage.hasNextPage);
  };

  const saveCurrentView = () => {
    const name = viewName.trim();
    if (!name) {
      return;
    }
    const saved = createSavedView({
      name,
      filters: {
        query,
        tags: selectedTags,
        status: NoteStatus.ACTIVE,
        updatedWithinDays,
      },
      sortField,
      sortDirection,
      pageSize,
    });
    setViewName("");
    setActiveViewId(saved.id);
  };

  const applySavedView = (viewId: string) => {
    const view = savedViews.find((item) => item.id === viewId);
    if (!view) {
      return;
    }

    setQuery(view.filters.query);
    setSelectedTags(view.filters.tags);
    setSortField(view.sortField);
    setSortDirection(view.sortDirection);
    setUpdatedWithinDays(view.filters.updatedWithinDays);
    setPageSize(view.pageSize);
    setActiveViewId(view.id);
  };

  const isNotesLoading = !hasHydrated || isLoading;

  return (
    <section className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-semibold">All Notes</h1>
        <p className="text-sm text-muted-foreground">
          Full-text search, tag filters, cursor pagination, and saved views.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-lg border p-3 md:grid-cols-2 xl:grid-cols-6">
        <Input
          value={query}
          onChange={(event) => {
            setActiveViewId(null);
            setQuery(event.target.value);
          }}
          placeholder="Search title/body/tags"
          className="xl:col-span-2"
        />
        <Select
          value={sortField}
          onValueChange={(value) => {
            setActiveViewId(null);
            setSortField(value as NoteSortField);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">Sort: Updated</SelectItem>
            <SelectItem value="createdAt">Sort: Created</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortDirection}
          onValueChange={(value) => {
            setActiveViewId(null);
            setSortDirection(value as NoteSortDirection);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest first</SelectItem>
            <SelectItem value="asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={updatedWithinDays === null ? "all" : String(updatedWithinDays)}
          onValueChange={(value) => {
            setActiveViewId(null);
            setUpdatedWithinDays(value === "all" ? null : Number(value));
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Updated window" />
          </SelectTrigger>
          <SelectContent>
            {updatedWithinDaysOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            setActiveViewId(null);
            setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Page size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6 / page</SelectItem>
            <SelectItem value="12">12 / page</SelectItem>
            <SelectItem value="24">24 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const selected = selectedTags.includes(tag);
          return (
            <Button
              key={tag}
              variant={selected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
            >
              #{tag}
            </Button>
          );
        })}
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex flex-wrap gap-2">
          <Input
            value={viewName}
            onChange={(event) => setViewName(event.target.value)}
            placeholder='Save current filter as "Work meetings last 7 days"'
            className="max-w-md"
          />
          <Button onClick={saveCurrentView}>Save View</Button>
          <Button
            variant="outline"
            onClick={() => {
              setActiveViewId(null);
              setQuery("");
              setSelectedTags([]);
              setSortField("updatedAt");
              setSortDirection("desc");
              setUpdatedWithinDays(null);
              setPageSize(12);
            }}
          >
            Reset
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {savedViews.map((view) => (
            <div key={view.id} className="flex items-center gap-1 rounded-md border p-1">
              <Button
                variant={activeViewId === view.id ? "default" : "ghost"}
                size="sm"
                onClick={() => applySavedView(view.id)}
              >
                {view.name}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => deleteSavedView(view.id)}>
                x
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AddNoteCard />
        {isNotesLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={`note-skeleton-${index}`} className="rounded-xl border p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            ))
          : visibleNotes.map((note) => (
              <NoteListCard
                key={note.id}
                note={note}
                onArchive={async (noteId) => {
                  await archiveMutation.mutateAsync(noteId);
                }}
                onMoveToTrash={async (noteId) => {
                  await trashMutation.mutateAsync(noteId);
                }}
              />
            ))}
      </div>

      {!isNotesLoading && filteredSortedNotes.length === 0 && (
        <p className="text-sm text-muted-foreground">No notes match this filter.</p>
      )}

      {!isNotesLoading && hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </section>
  );
}
