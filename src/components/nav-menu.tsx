"use client";

import { NotebookPen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";

const links = [
  {
    label: "Home",
    href: "/home",
  },
  {
    label: "Notes",
    href: "/notes",
  },
  {
    label: "Calendar",
    href: "/calendar",
  },
  {
    label: "Archive",
    href: "/archive",
  },
  {
    label: "Trash",
    href: "/trash",
  },
];

export function NavigationMenuDemo() {
  const pathname = usePathname();

  return (
    <div className="flex w-full items-center gap-4">
      <Link href="/" className="flex items-center gap-2 font-semibold" prefetch>
        <NotebookPen className="h-5 w-5" />
        <span>Happy Notes</span>
      </Link>

      <nav className="hidden items-center gap-2 md:flex">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              href={link.href}
              prefetch
              key={link.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 ml-auto">
        <ModeToggle />
      </div>
    </div>
  );
}
