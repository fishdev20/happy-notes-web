import ErrorState from "@/components/error-state";

export default function NotFoundPage() {
  return (
    <ErrorState
      title="Page Not Found"
      description="The page you requested does not exist or may have been moved."
      primaryAction={{ label: "Go Home", href: "/" }}
      secondaryAction={{ label: "Open Notes", href: "/notes" }}
    />
  );
}
