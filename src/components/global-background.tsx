export default function GlobalBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="animate-float-slow absolute -top-28 -left-16 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="animate-float-medium absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      <div className="animate-float-fast absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent/50 blur-3xl" />
    </div>
  );
}
