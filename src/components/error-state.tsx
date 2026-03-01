import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
};

function ActionButton({
  action,
  variant,
}: {
  action: NonNullable<ErrorStateProps["primaryAction"]>;
  variant: "default" | "outline";
}) {
  if (action.href) {
    return (
      <Button asChild variant={variant}>
        <Link href={action.href}>{action.label}</Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export default function ErrorState({
  title,
  description,
  primaryAction,
  secondaryAction,
}: ErrorStateProps) {
  return (
    <div className="flex h-full min-h-[calc(100svh-8rem)] items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-background/70 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-muted">
          <AlertTriangle className="h-5 w-5 text-primary" />
        </div>

        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        {(primaryAction || secondaryAction) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {primaryAction ? <ActionButton action={primaryAction} variant="default" /> : null}
            {secondaryAction ? <ActionButton action={secondaryAction} variant="outline" /> : null}
          </div>
        )}
      </div>
    </div>
  );
}
