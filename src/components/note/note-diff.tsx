import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import NoteEditor from "./note-editor";
import NotePreview from "./note-preview";

interface NoteDiffProps {
  value: string;
  onChange: (value: string) => void;
}

export default function NoteDiff({ value, onChange }: NoteDiffProps) {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={50} className="h-full" maxSize={80}>
        <NoteEditor value={value} onChange={onChange} />
      </ResizablePanel>
      <ResizableHandle
        withHandle
        className="bg-gray-400 relative flex items-center justify-center"
      />
      <ResizablePanel defaultSize={50} className="h-full" maxSize={80}>
        <NotePreview markdownContent={value} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
