"use client";

import { useCreateNoteMutation } from "@/hooks/use-notes-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AddNotePage() {
  const router = useRouter();
  const createMutation = useCreateNoteMutation();
  const createdRef = useRef(false);

  useEffect(() => {
    if (createdRef.current) {
      return;
    }

    createdRef.current = true;

    createMutation
      .mutateAsync({
        title: "Untitled note",
        content: "",
        tag: [],
      })
      .then((created) => {
        router.replace(`/notes/${created.id}`);
      })
      .catch((error) => {
        createdRef.current = false;
        console.error(error);
        router.replace("/notes");
      });
  }, [createMutation, router]);

  return (
    <div className="flex h-full min-h-[calc(100svh-8rem)] items-center justify-center p-4">
      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
        <Loader2 className="h-4 w-4 animate-spin" />
        Creating your note...
      </div>
    </div>
  );
}
