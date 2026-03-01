"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  console.error("Global fatal error:", error);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm backdrop-blur">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-muted">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Critical Error</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              A fatal runtime error occurred. Try reloading this screen.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => reset()}>Reload</Button>
              <Button variant="outline" onClick={() => window.location.assign("/")}>
                Go To Landing
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
