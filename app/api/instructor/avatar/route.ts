import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, instructors } from "@/lib/db/schema";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP and GIF images are allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
    }

    // Delete old blob if present
    const existing = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { image: true },
    });
    if (existing?.image?.includes("blob.vercel-storage.com")) {
      await del(existing.image).catch(() => {});
    }

    const ext      = file.type.split("/")[1] ?? "jpg";
    const filename = `avatars/${session.user.id}-${Date.now()}.${ext}`;
    const blob     = await put(filename, file, { access: "private" });

    await db.update(users)
      .set({ image: blob.url, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    await db.update(instructors)
      .set({ photoUrl: blob.url })
      .where(eq(instructors.userId, session.user.id));

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[instructor avatar upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
