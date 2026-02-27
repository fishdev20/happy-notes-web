import Link from "next/link";
import { Archive, CalendarDays, PlusSquare, Search, Trash2 } from "lucide-react";

const shortcuts = [
  {
    title: "New Note",
    description: "Capture your next idea instantly.",
    href: "/notes/new",
    icon: PlusSquare,
  },
  {
    title: "All Notes",
    description: "Search, filter, and save views.",
    href: "/notes",
    icon: Search,
  },
  {
    title: "Calendar",
    description: "Review notes by timeline.",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Archive",
    description: "Keep old notes out of the way.",
    href: "/archive",
    icon: Archive,
  },
  {
    title: "Trash",
    description: "Recover or permanently delete.",
    href: "/trash",
    icon: Trash2,
  },
];

export default function HomePage() {
  return (
    <section className="space-y-6 p-4">
      <div className="animate-fade-up rounded-2xl border bg-card/80 p-6 backdrop-blur-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Jump into your notes, organize with tags and filters, and navigate your writing with the
          calendar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map((item, index) => (
          <Link
            key={item.title}
            href={item.href}
            className="animate-fade-up rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur-sm transition hover:border-primary/50 hover:shadow-md"
            style={{ animationDelay: `${80 + index * 60}ms` }}
          >
            <item.icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
