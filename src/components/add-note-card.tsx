import { Plus } from "lucide-react";
import Link from "next/link";
import { Card } from "./ui/card";

export default function AddNoteCard() {
  return (
    <Card className="p-4 shadow-md rounded-lg border-dashed">
      <Link
        href="/notes/new"
        className="w-full h-full min-h-40 flex flex-col justify-center items-center gap-2"
      >
        <Plus size={32} />
        <span className="text-sm font-medium text-muted-foreground">Create new note</span>
      </Link>
    </Card>
  );
}
