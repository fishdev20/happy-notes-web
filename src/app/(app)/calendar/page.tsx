import { CalendarDays } from "lucide-react";
import CalendarViewClient from "./_components/calendar-view-client";

export default function CalendarPage() {
  return (
    <section className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <CalendarDays className="h-6 w-6" />
          Calendar
        </h1>
        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          Plan by timeline
        </span>
      </div>

      <CalendarViewClient />
    </section>
  );
}
