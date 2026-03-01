"use client";

import { NoteStatus } from "@/@types/models/Note";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotesQuery } from "@/hooks/use-notes-query";
import { Calendar as BigCalendar, View, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type NoteEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  noteId: string;
  color: string;
};

const viewOptions: { label: string; value: View }[] = [
  { label: "Month", value: Views.MONTH },
  { label: "Week", value: Views.WEEK },
  { label: "Day", value: Views.DAY },
  { label: "Agenda", value: Views.AGENDA },
];

export default function CalendarViewClient() {
  const router = useRouter();
  const { data: notes = [], isLoading } = useNotesQuery();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.MONTH);

  const events = useMemo<NoteEvent[]>(
    () =>
      notes
        .filter((note) => note.status === NoteStatus.ACTIVE)
        .map((note) => {
          const start = new Date(note.updatedAt);
          const end = new Date(start.getTime() + 45 * 60 * 1000);
          return {
            id: note.id,
            title: note.title,
            start,
            end,
            noteId: note.id,
            color: note.color,
          };
        }),
    [notes],
  );

  const handleNavigate = (direction: "PREV" | "NEXT" | "TODAY") => {
    const next = new Date(date);
    if (direction === "TODAY") {
      setDate(new Date());
      return;
    }

    if (view === Views.MONTH) {
      next.setMonth(next.getMonth() + (direction === "NEXT" ? 1 : -1));
    } else if (view === Views.WEEK) {
      next.setDate(next.getDate() + (direction === "NEXT" ? 7 : -7));
    } else {
      next.setDate(next.getDate() + (direction === "NEXT" ? 1 : -1));
    }
    setDate(next);
  };

  return (
    <div className="relative rounded-xl border bg-card p-3">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleNavigate("PREV")}
          aria-label="Previous"
        >
          <ChevronLeft />
        </Button>
        <Button variant="outline" onClick={() => handleNavigate("TODAY")}>
          Today
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleNavigate("NEXT")}
          aria-label="Next"
        >
          <ChevronRight />
        </Button>

        <p className="ml-2 text-sm font-medium">
          {format(date, view === Views.DAY ? "PPP" : "MMMM yyyy")}
        </p>

        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {events.length} note events
          </span>
          <div className="hidden gap-2 md:flex">
            {viewOptions.map((item) => (
              <Button
                key={item.value}
                variant={view === item.value ? "default" : "outline"}
                size="sm"
                onClick={() => setView(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="w-36 md:hidden">
            <Select value={view} onValueChange={(value) => setView(value as View)}>
              <SelectTrigger>
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                {viewOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="h-[72svh] min-h-[520px] overflow-hidden rounded-lg border bg-background p-2">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={date}
          view={view}
          onNavigate={(nextDate) => setDate(nextDate)}
          onView={(nextView) => setView(nextView)}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          popup
          selectable
          components={{
            toolbar: () => null,
          }}
          messages={{
            showMore: (total) => `+${total} more`,
          }}
          onSelectEvent={(event) => router.push(`/notes/${(event as NoteEvent).noteId}`)}
          eventPropGetter={(event) => {
            const noteEvent = event as NoteEvent;
            return {
              className: "rbc-note-event",
              style: {
                backgroundColor: noteEvent.color,
                borderColor: noteEvent.color,
                color: "var(--primary-foreground)",
              },
            };
          }}
        />
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/45 backdrop-blur-sm">
          <div className="rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
            Loading calendar data...
          </div>
        </div>
      )}
    </div>
  );
}
