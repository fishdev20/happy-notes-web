"use client";

import { cn } from "@/lib/utils";
import {
  Bold,
  Braces,
  CheckSquare,
  Code2,
  Heading2,
  Image,
  Link2,
  List,
  ListOrdered,
  MessageSquareQuote,
  Minus,
  Sheet,
  Strikethrough,
  Type,
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type InsertToolbarProps = {
  onInsert: (snippet: string) => void;
  className?: string;
};

const quickActions = [
  { label: "Heading", icon: Heading2, snippet: "## Section Title" },
  { label: "Bold", icon: Bold, snippet: "**Bold text**" },
  { label: "Italic", icon: Type, snippet: "*Italic text*" },
  { label: "Strike", icon: Strikethrough, snippet: "~~Strikethrough~~" },
  { label: "Bulleted list", icon: List, snippet: "- Item 1\n- Item 2\n- Item 3" },
  { label: "Numbered list", icon: ListOrdered, snippet: "1. First\n2. Second\n3. Third" },
  { label: "Task list", icon: CheckSquare, snippet: "- [ ] Task one\n- [ ] Task two" },
  { label: "Quote", icon: MessageSquareQuote, snippet: "> Quote or reflection" },
  { label: "Inline code", icon: Code2, snippet: "`const value = true`" },
  { label: "Code block", icon: Braces, snippet: "```ts\n// code\n```" },
  {
    label: "Table",
    icon: Sheet,
    snippet: "| Column | Value |\n| --- | --- |\n| A | B |",
  },
  { label: "Link", icon: Link2, snippet: "[Link title](https://example.com)" },
  { label: "Image", icon: Image, snippet: "![Alt text](https://via.placeholder.com/600x300)" },
  { label: "Divider", icon: Minus, snippet: "---" },
];

export default function InsertToolbar({ onInsert, className }: InsertToolbarProps) {
  return (
    <div className={cn("w-full", className)}>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border/60 [&_[data-slot=scroll-area-viewport]]:overflow-x-auto [&_[data-slot=scroll-area-viewport]]:overflow-y-hidden [&_[data-slot=scroll-area-viewport]]:touch-pan-x">
        <div className="flex min-w-max items-center gap-1 p-1">
          <TooltipProvider>
            {quickActions.map(({ label, icon: Icon, snippet }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => onInsert(snippet)}
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
