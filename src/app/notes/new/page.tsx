"use client";
import { NoteLayout } from "@/@types/models/Note";
import Chatbot from "@/components/note/chat-bot";
import NoteDiff from "@/components/note/note-diff";
import NoteEditor from "@/components/note/note-editor";
import NotePreview from "@/components/note/note-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useLayoutStore from "@/store/use-layout-store";
import useNoteStore from "@/store/use-note-store";
import { Code, Columns2, Eye, Save } from "lucide-react";

const toggleItems = [
  {
    value: NoteLayout.SOURCE,
    icon: <Code />,
    label: "Editor Mode",
  },
  {
    value: NoteLayout.DIFF,
    icon: <Columns2 />,
    label: "Diff Mode",
  },
  {
    value: NoteLayout.PREVIEW,
    icon: <Eye />,
    label: "Preview Mode",
  },
];

export default function AddNote() {
  const { markdownContent, setMarkdownContent } = useNoteStore();
  const { isScrolled, activeNoteLayout, setActiveNoteLayout } = useLayoutStore();

  // useEffect(() => {
  //   setActiveNoteLayout(NoteLayout.DIFF);
  // }, []);

  const handleChange = (value: string) => {
    setMarkdownContent(value);
  };

  const handleLayoutChange = (layout: NoteLayout | string) => {
    // Ensure it's one of the valid layouts
    if (
      layout === NoteLayout.SOURCE ||
      layout === NoteLayout.DIFF ||
      layout === NoteLayout.PREVIEW
    ) {
      setActiveNoteLayout(layout);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-[calc(100svh-4rem-4rem)] relative">
      <div
        className={`sticky top-0 flex justify-end p-2 z-10 transition-all duration-300 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}
      >
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Save />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Save your note 📝</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input id="title" defaultValue="Untitled_1" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  <Save />
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <TooltipProvider>
            <ToggleGroup
              type="single"
              value={activeNoteLayout}
              onValueChange={handleLayoutChange}
              className="gap-1"
            >
              {toggleItems.map(({ value, icon, label }) => (
                <Tooltip key={value}>
                  <TooltipTrigger asChild>
                    <div>
                      <ToggleGroupItem value={value} aria-label={label}>
                        {icon}
                      </ToggleGroupItem>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </TooltipProvider>
        </div>
      </div>
      {activeNoteLayout === NoteLayout.SOURCE && (
        <NoteEditor value={markdownContent} onChange={handleChange} />
      )}
      {activeNoteLayout === NoteLayout.DIFF && (
        <NoteDiff value={markdownContent} onChange={handleChange} />
      )}
      {activeNoteLayout === NoteLayout.PREVIEW && <NotePreview markdownContent={markdownContent} />}
      <Chatbot />
    </div>
  );
}
