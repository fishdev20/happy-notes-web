"use client";

import { useEffect } from "react";

import ErrorState from "@/components/error-state";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Something Went Wrong"
      description="An unexpected error occurred while rendering this page."
      primaryAction={{
        label: "Try Again",
        onClick: () => reset(),
      }}
      secondaryAction={{ label: "Go Home", href: "/" }}
    />
  );
}
