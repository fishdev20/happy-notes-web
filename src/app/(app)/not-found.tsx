import ErrorState from "@/components/error-state";

export default function AppNotFoundPage() {
  return (
    <ErrorState
      title="Note Or Page Not Found"
      description="We could not find this resource in your workspace."
      primaryAction={{ label: "Back To Notes", href: "/notes" }}
      secondaryAction={{ label: "Go Home", href: "/home" }}
    />
  );
}
