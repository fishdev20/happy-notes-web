import { Plus } from "lucide-react";
import Link from "next/link";
import { Card } from "./ui/card";

export default function AddNoteCard() {
  return (
    <Card className="p-4 shadow-md rounded-lg">
      <Link href={"/notes/new"} className="w-full h-full flex justify-center items-center">
        <Plus size={48} color="black" />
      </Link>
    </Card>
  );
}
