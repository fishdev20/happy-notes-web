"use client";

import { useEffect } from "react";

import ErrorState from "@/components/error-state";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppSegmentErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("App segment error:", error);
  }, [error]);

  const description =
    process.env.NODE_ENV === "development"
      ? `This section failed to load. ${error.message || "Unknown error."}`
      : "This section failed to load. You can retry or return to your dashboard.";

  return (
    <ErrorState
      title="Workspace Error"
      description={description}
      primaryAction={{
        label: "Retry",
        onClick: () => reset(),
      }}
      secondaryAction={{ label: "Go Home", href: "/home" }}
    />
  );
}
