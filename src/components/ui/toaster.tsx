"use client";

import useToastStore from "@/store/use-toast-store";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

const variantStyles = {
  success: {
    icon: CheckCircle2,
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200",
  },
  error: {
    icon: XCircle,
    className:
      "border-red-300 bg-red-50 text-red-800 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200",
  },
  info: {
    icon: Info,
    className: "border-border bg-card/95 text-card-foreground",
  },
} as const;

export default function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="pointer-events-none fixed top-5 right-5 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((toast) => {
        const style = variantStyles[toast.variant];
        const Icon = style.icon;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border p-3 shadow-lg ${style.className}`}
          >
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-xs opacity-90">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-current opacity-70 transition hover:opacity-100"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
