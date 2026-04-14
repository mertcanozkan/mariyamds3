import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { instructors } from "@/lib/db/schema";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

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
      return NextResponse.json({ error: "Only JPEG, PNG, WebP and PDF files are allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });
    }

    const instructor = await db.query.instructors.findFirst({
      where: eq(instructors.userId, session.user.id),
      columns: { id: true, insuranceDocumentUrl: true },
    });

    if (!instructor) return NextResponse.json({ error: "Instructor not found" }, { status: 404 });

    // Delete old document if present
    if (instructor.insuranceDocumentUrl?.includes("blob.vercel-storage.com")) {
      await del(instructor.insuranceDocumentUrl).catch(() => {});
    }

    const ext      = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1] ?? "jpg";
    const filename = `insurance/${session.user.id}-${Date.now()}.${ext}`;
    const blob     = await put(filename, file, { access: "private" });

    await db.update(instructors)
      .set({ insuranceDocumentUrl: blob.url })
      .where(eq(instructors.userId, session.user.id));

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[insurance doc upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// Proxy the private blob back to the browser
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "instructor") {
      return new NextResponse(null, { status: 401 });
    }

    const instructor = await db.query.instructors.findFirst({
      where: eq(instructors.userId, session.user.id),
      columns: { insuranceDocumentUrl: true },
    });

    if (!instructor?.insuranceDocumentUrl) {
      return new NextResponse(null, { status: 404 });
    }

    const blobRes = await fetch(instructor.insuranceDocumentUrl, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });

    if (!blobRes.ok) return new NextResponse(null, { status: blobRes.status });

    const contentType = blobRes.headers.get("content-type") ?? "application/octet-stream";
    const buffer      = await blobRes.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[insurance doc proxy]", err);
    return new NextResponse(null, { status: 500 });
  }
}
