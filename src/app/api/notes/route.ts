import { getRandomNoteColor } from "@/lib/note-color";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { normalizeTags, serializeNote } from "@/lib/server/notes";
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

  const providerDisplayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;
  const providerAvatarUrl = user.user_metadata?.avatar_url ?? null;
  const existingProfile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
    },
  });

  if (!existingProfile) {
    await prisma.userProfile.create({
      data: {
        id: user.id,
        email: user.email,
        displayName: providerDisplayName,
        avatarUrl: providerAvatarUrl,
      },
    });
  } else {
    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        email: user.email,
        // Keep profile stable across OAuth providers.
        displayName: existingProfile.displayName || providerDisplayName,
        avatarUrl: existingProfile.avatarUrl || providerAvatarUrl,
      },
    });
  }

  return user;
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: {
      ownerId: user.id,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });

  return NextResponse.json({ notes: notes.map(serializeNote) });
}

type CreateNoteBody = {
  title?: string;
  content?: string;
  tag?: string[];
};

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as CreateNoteBody;
  const title =
    typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Untitled note";
  const content = typeof body.content === "string" ? body.content : "";
  const tags = normalizeTags(body.tag);

  const note = await prisma.note.create({
    data: {
      ownerId: user.id,
      title,
      body: content,
      color: getRandomNoteColor(),
      tags: {
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

  return NextResponse.json({ note: serializeNote(note) }, { status: 201 });
}
