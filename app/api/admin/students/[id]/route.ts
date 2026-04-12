import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { studentProfiles, users } from "@/lib/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const student = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.id, id),
      with: {
        user: true,
        bookings: { with: { instructor: true, course: true, payment: true, progress: true } },
        payments: true,
        lessonProgress: { with: { instructor: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found", code: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (err) {
    console.error("[admin/students/:id GET]", err);
    return NextResponse.json({ error: "Failed to fetch student", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const allowedProfileFields = [
      "firstName", "lastName", "phone", "notes", "isActive",
      "addressLine1", "addressLine2", "city", "postcode",
      "emergencyContactName", "emergencyContactPhone",
    ];
    const profileUpdates: Record<string, unknown> = {};
    for (const field of allowedProfileFields) {
      if (field in body) profileUpdates[field] = body[field];
    }

    if (Object.keys(profileUpdates).length > 0) {
      await db.update(studentProfiles).set(profileUpdates).where(eq(studentProfiles.id, id));
    }

    if ("role" in body || "emailVerified" in body) {
      const profile = await db.query.studentProfiles.findFirst({ where: eq(studentProfiles.id, id) });
      if (profile) {
        await db.update(users).set({ role: body.role, updatedAt: new Date() }).where(eq(users.id, profile.userId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/students/:id PATCH]", err);
    return NextResponse.json({ error: "Update failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const student = await db.query.studentProfiles.findFirst({ where: eq(studentProfiles.id, id) });
    if (!student) {
      return NextResponse.json({ error: "Student not found", code: "NOT_FOUND" }, { status: 404 });
    }

    await db.delete(studentProfiles).where(eq(studentProfiles.id, id));
    await db.delete(users).where(eq(users.id, student.userId));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23503") {
      return NextResponse.json(
        { error: "Cannot delete student with existing bookings or payments. Deactivate instead.", code: "CONFLICT" },
        { status: 409 }
      );
    }
    console.error("[admin/students/:id DELETE]", err);
    return NextResponse.json({ error: "Delete failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
