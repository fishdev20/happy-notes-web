"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportNote, ExportFormat } from "@/lib/note-export";
import useToastStore from "@/store/use-toast-store";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

type ExportNoteMenuProps = {
  title: string;
  markdown: string;
  iconOnlyOnMobile?: boolean;
};

const formats: Array<{ label: string; value: ExportFormat }> = [
  { label: "PDF", value: "pdf" },
  { label: "HTML", value: "html" },
  { label: "DOCX", value: "docx" },
  { label: "TXT", value: "txt" },
  { label: "Markdown (.md)", value: "md" },
];

export default function ExportNoteMenu({
  title,
  markdown,
  iconOnlyOnMobile = false,
}: ExportNoteMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const pushToast = useToastStore((state) => state.pushToast);

  const handleExport = async (format: ExportFormat) => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      await exportNote({ title, markdown }, format);
      pushToast({
        variant: "success",
        title: "Export complete",
        description: `Saved as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      const description =
        error instanceof Error && error.message ? error.message : "Could not export note.";
      pushToast({
        variant: "error",
        title: "Export failed",
        description,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isExporting}
          size={iconOnlyOnMobile ? "icon" : "default"}
          className={iconOnlyOnMobile ? "sm:h-9 sm:w-auto sm:px-3" : undefined}
        >
          {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
          {iconOnlyOnMobile ? <span className="hidden sm:inline">Export</span> : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => (
          <DropdownMenuItem
            key={format.value}
            onSelect={(event) => {
              event.preventDefault();
              void handleExport(format.value);
            }}
          >
            {format.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
