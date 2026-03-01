import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { normalizeTags, serializeNote, toPrismaStatus } from "@/lib/server/notes";
import { NoteStatus as PrismaNoteStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return user;
}

async function findOwnedNote(userId: string, noteId: string) {
  return prisma.note.findFirst({
    where: {
      id: noteId,
      ownerId: userId,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const note = await findOwnedNote(user.id, id);

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ note: serializeNote(note) });
}

type UpdateNoteBody = {
  title?: string;
  content?: string;
  tag?: string[];
  status?: string;
  color?: string;
};

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await findOwnedNote(user.id, id);

  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as UpdateNoteBody;
  const tags = body.tag ? normalizeTags(body.tag) : null;
  const nextStatus = toPrismaStatus(body.status);

  const note = await prisma.note.update({
    where: { id: existing.id },
    data: {
      title: typeof body.title === "string" ? body.title.trim() || "Untitled note" : undefined,
      body: typeof body.content === "string" ? body.content : undefined,
      status: nextStatus ?? undefined,
      color: typeof body.color === "string" ? body.color : undefined,
      archivedAt:
        nextStatus === PrismaNoteStatus.ARCHIVED
          ? new Date()
          : nextStatus === PrismaNoteStatus.ACTIVE
            ? null
            : undefined,
      deletedAt:
        nextStatus === PrismaNoteStatus.TRASH
          ? new Date()
          : nextStatus === PrismaNoteStatus.ACTIVE
            ? null
            : undefined,
      tags:
        tags === null
          ? undefined
          : {
              deleteMany: {},
              create: tags.map((slug) => ({
                tag: {
                  connectOrCreate: {
                    where: {
                      ownerId_slug: {
                        ownerId: user.id,
                        slug,
                      },
                    },
                    create: {
                      ownerId: user.id,
                      slug,
                      name: slug,
                    },
                  },
                },
              })),
            },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  return NextResponse.json({ note: serializeNote(note) });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await findOwnedNote(user.id, id);

  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await prisma.note.delete({
    where: {
      id: existing.id,
    },
  });

  return NextResponse.json({ success: true });
}
