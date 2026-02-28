import { ModeToggle } from "@/components/mode-toggle";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NotebookPen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const brands = ["ZenFlow", "Luma", "Northstar", "Afterglow", "Bluebird", "Atlas"];

const testimonials = [
  {
    name: "Dana C.",
    role: "Product Manager",
    quote: "The saved views removed so much weekly chaos for my team.",
    avatar: "/images/telescope.png",
  },
  {
    name: "Omar H.",
    role: "Engineer",
    quote: "Search + tags + calendar works exactly how I wanted.",
    avatar: "/images/microscope.png",
  },
  {
    name: "Mia K.",
    role: "Student",
    quote: "I can jump between class notes and revisions instantly.",
    avatar: "/images/pen.png",
  },
];

function TryNowButton() {
  return (
    <Link
      href="/home"
      className="inline-flex rounded-full border border-primary/40 bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground shadow-sm"
    >
      Try Now
    </Link>
  );
}

export default async function LandingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-56 -left-48 h-[44rem] w-[44rem] rounded-full bg-primary/40 blur-[120px] sm:h-[56rem] sm:w-[56rem]" />
        <div className="absolute top-1/4 -right-56 h-[46rem] w-[46rem] rounded-full bg-secondary/45 blur-[130px] sm:h-[60rem] sm:w-[60rem]" />
        <div className="absolute -bottom-64 left-1/4 h-[42rem] w-[42rem] rounded-full bg-primary/35 blur-[120px] sm:h-[54rem] sm:w-[54rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.18),transparent_38%),radial-gradient(circle_at_85%_35%,hsl(var(--secondary)/0.2),transparent_42%),radial-gradient(circle_at_55%_85%,hsl(var(--primary)/0.15),transparent_40%)]" />
      </div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
            <NotebookPen className="h-5 w-5 text-primary" />
            Happy Notes
          </span>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <span>Notes</span>
            <span>Search</span>
            <span>Calendar</span>
            <span>AI Chat</span>
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ModeToggle />
            <Link
              href="/home"
              className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground sm:px-4 sm:py-2 sm:text-sm"
            >
              Explore Notes
            </Link>
            <Link
              href="/login"
              className="hidden rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground sm:inline-flex sm:text-sm"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-border">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-fade-up">
              <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
                AI Note Workspace
              </span>
              <h1 className="mt-4 text-4xl leading-[0.98] font-semibold tracking-tight text-primary sm:text-7xl">
                Note taking,
                <br />
                made simple
              </h1>
              <p className="mt-5 max-w-xl text-sm text-muted-foreground sm:text-base">
                Capture markdown notes, chat with AI, and organize everything with full-text search,
                tags, saved views, and calendar review.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/home"
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Start now
                </Link>
                <Link
                  href="/home"
                  className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground"
                >
                  Watch demo
                </Link>
              </div>
            </div>

            <div className="animate-fade-up-delay-1 relative">
              <div className="absolute -top-4 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-muted p-3">
                    <Image
                      src="/images/calendar.png"
                      alt="Calendar"
                      width={190}
                      height={120}
                      className="h-24 w-full object-contain"
                    />
                  </div>
                  <div className="rounded-2xl border border-border bg-muted p-3">
                    <Image
                      src="/images/bar-chart.png"
                      alt="Analytics"
                      width={190}
                      height={120}
                      className="h-24 w-full object-contain"
                    />
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Today, 3 notes</span>
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      Live
                    </span>
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs text-foreground">
                    <div className="rounded-md border border-border px-2 py-1">
                      Project sync #meeting
                    </div>
                    <div className="rounded-md border border-border px-2 py-1">
                      Launch checklist #work
                    </div>
                    <div className="rounded-md border border-border px-2 py-1">
                      Weekly reflection
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="relative space-y-8 sm:space-y-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-center">
              <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="relative flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold sm:text-base">Web design</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Turn rough thoughts into clean markdown notes with headings, checklists, and
                      rich formatting.
                    </p>
                  </div>
                  <Image
                    src="/images/pen.png"
                    alt="pen"
                    width={60}
                    height={60}
                    className="absolute -top-8 -right-5 h-10 w-10 sm:-top-10 sm:-right-8 sm:h-[60px] sm:w-[60px]"
                  />
                </div>
                <div className="mt-4 space-y-3 text-xs text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Goals</p>
                    <p>Capture decisions fast and keep them easy to find later.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">What to do?</p>
                    <p>Write notes while you think</p>
                    <p>Save with tags and status</p>
                  </div>
                </div>
              </article>

              <div className="pl-0 lg:pl-6">
                <h2 className="text-3xl leading-tight font-medium text-primary sm:text-5xl">
                  Write Notes
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Capture ideas, meetings, and plans in seconds.
                </p>
                <div className="mt-3">
                  <TryNowButton />
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div className="relative flex flex-col justify-center lg:h-96">
                <Image
                  src="/arrow.svg"
                  alt=""
                  width={170}
                  height={68}
                  className="absolute -top-4 -right-8 hidden h-auto w-[170px] dark:invert lg:block"
                />
                <h2 className="text-3xl leading-tight font-medium text-primary sm:text-5xl">
                  Plan your day
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Keep focused with tags, sorting, and saved filters.
                </p>
                <div className="mt-3">
                  <TryNowButton />
                </div>
              </div>

              <div className="flex h-full flex-col justify-center items-center">
                <div className="mb-2 w-full max-w-sm rounded-xl border border-border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Image src="/images/calendar.png" alt="calendar" width={30} height={30} />
                    <div>
                      <p className="text-sm font-semibold">Monday</p>
                      <p className="text-[11px] text-muted-foreground">May, 3rd</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li>○ Do laundry</li>
                      <li>○ Team standup</li>
                      <li>○ Review PR notes</li>
                      <li>○ Product sync</li>
                      <li>○ Write follow-ups</li>
                      <li>○ Update roadmap</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li>○ #meeting view</li>
                      <li>○ #work this week</li>
                      <li>○ Recently updated</li>
                      <li>○ Draft notes</li>
                      <li>○ Archive cleanup</li>
                      <li>○ Personal ideas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div className="flex h-full flex-col justify-start">
                <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Image src="/images/microscope.png" alt="facts" width={30} height={30} />
                    <div>
                      <p className="text-sm font-semibold">AI Copilot</p>
                      <p className="text-[11px] text-muted-foreground">Active now</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 rounded-xl border border-border bg-card p-3 shadow-sm">
                  <p className="text-xs text-muted-foreground">
                    Ask the assistant to summarize long notes, draft action items, and rewrite text
                    for clarity.
                  </p>
                  <div className="mt-3 w-fit rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <p>Summarize note</p>
                    <p>Extract tasks</p>
                    <p>Rewrite draft</p>
                  </div>
                </div>
              </div>

              <div className="relative flex flex-col justify-center lg:h-80">
                <Image
                  src="/arrow.svg"
                  alt=""
                  width={170}
                  height={68}
                  className="absolute -top-24 -left-2 hidden h-auto w-[170px] scale-x-[-1] dark:invert lg:block"
                />
                <h2 className="text-3xl leading-tight font-medium text-primary sm:text-5xl">
                  Chat with AI
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Think faster with inline help while writing.
                </p>
                <div className="mt-3">
                  <TryNowButton />
                </div>
              </div>
            </div>

            <div className="pt-1">
              <div className="relative text-center">
                <Image
                  src="/images/bar-chart.png"
                  alt="chart icon"
                  width={48}
                  height={48}
                  className="absolute top-0 left-0 hidden sm:block"
                />
                <Image
                  src="/arrow-curve.svg"
                  alt="chart icon"
                  width={42}
                  height={42}
                  className="absolute -top-24 left-32 hidden h-auto w-[280px] dark:invert lg:block"
                />
                <h2 className="text-3xl leading-tight font-medium text-primary sm:text-5xl">
                  Review on Calendar
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Revisit notes by day, week, and month.
                </p>
                <Image
                  src="/images/telescope.png"
                  alt="telescope icon"
                  width={48}
                  height={48}
                  className="absolute top-0 right-0 hidden sm:block"
                />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <article className="rounded-xl border border-border bg-card p-3 shadow-sm">
                  <p className="text-base font-semibold">Work Notes</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Search in title/body, filter by #meeting, and sort by recently updated.
                  </p>
                  <div className="mt-3 w-fit rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <p>saved: #meeting + 7d</p>
                    <p>sort: updated desc</p>
                    <p>view: Work This Week</p>
                  </div>
                </article>
                <article className="rounded-xl border border-border bg-card p-3 shadow-sm">
                  <p className="text-base font-semibold">Personal Notes</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Keep ideas, journals, and bookmarks in one searchable timeline.
                  </p>
                  <div className="mt-3 flex h-12 items-center justify-center rounded-md border border-border bg-muted">
                    <Image src="/images/telescope.png" alt="physics icon" width={52} height={32} />
                  </div>
                </article>
              </div>
              <div className="mt-5 flex justify-center">
                <TryNowButton />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            <p className="text-center text-xs text-muted-foreground">Trusted by Companies</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {brands.map((brand) => (
                <div
                  key={brand}
                  className="rounded-xl border border-border bg-card px-3 py-2 text-center text-xs font-semibold text-muted-foreground"
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <h3 className="text-sm font-semibold">What users say</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {testimonials.map((item, index) => (
              <article
                key={item.name}
                className="animate-fade-up rounded-2xl border border-border bg-card p-4 shadow-sm"
                style={{ animationDelay: `${80 + index * 90}ms` }}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border border-border object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">{item.role}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 sm:pb-12">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-accent p-7 text-center sm:p-10">
            <Image
              src="/pen.svg"
              alt="Pen icon"
              width={92}
              height={92}
              className="animate-float-2 mx-auto mb-3 h-14 w-14 object-contain opacity-80"
            />
            <h4 className="text-3xl leading-tight font-semibold text-primary sm:text-5xl">
              Ready to take your notes
              <br />
              to the next level?
            </h4>
            <Link
              href="/home"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Try now
            </Link>
          </div>
        </section>

        <section className="bg-primary px-4 py-8 text-primary-foreground sm:px-6 sm:py-12">
          <div className="mx-auto grid w-full max-w-6xl gap-6 sm:grid-cols-[1fr_1fr]">
            <div>
              <h5 className="text-2xl leading-tight font-semibold sm:text-4xl">
                Build a note workflow
                <br />
                that stays fast as
                <br />
                your knowledge grows
              </h5>
              <p className="mt-4 max-w-md text-sm text-primary-foreground/90">
                Build your own note system with search, tags, calendar, and AI assistance.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-primary-foreground/95">
                <span className="rounded-full border border-primary-foreground/40 px-3 py-1">
                  support@long.app
                </span>
                <span className="rounded-full border border-primary-foreground/40 px-3 py-1">
                  +1 (555) 018-3341
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-card p-4 text-card-foreground shadow-sm">
              <p className="text-xs font-semibold">Let&apos;s Talk</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Email
                </div>
                <div className="rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Name
                </div>
                <div className="rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Message
                </div>
                <button className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
