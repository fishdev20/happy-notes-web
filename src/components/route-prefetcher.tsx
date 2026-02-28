"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ROUTES_TO_PREFETCH = [
  "/home",
  "/notes",
  "/notes/new",
  "/calendar",
  "/archive",
  "/trash",
  "/settings",
];

export default function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    const run = () => {
      ROUTES_TO_PREFETCH.forEach((route) => {
        router.prefetch(route);
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const callbackId = window.requestIdleCallback(() => run(), { timeout: 1800 });
      return () => window.cancelIdleCallback(callbackId);
    }

    const timeoutId = window.setTimeout(run, 400);
    return () => window.clearTimeout(timeoutId);
  }, [router]);

  return null;
}
