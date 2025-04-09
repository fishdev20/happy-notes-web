import { Dot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="justify-left flex space-x-1">
      <div className="rounded-lg bg-muted">
        <div className="flex -space-x-2.5">
          <Dot className="h-4 w-4 animate-typing-dot-bounce" />
          <Dot className="h-4 w-4 animate-typing-dot-bounce" />
          <Dot className="h-4 w-4 animate-typing-dot-bounce" />
        </div>
      </div>
    </div>
  );
}
