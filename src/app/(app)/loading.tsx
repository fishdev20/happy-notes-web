import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex h-full min-h-[calc(100svh-8rem)] items-center justify-center p-4">
      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    </div>
  );
}
