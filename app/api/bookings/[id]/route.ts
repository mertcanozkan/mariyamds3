import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, studentProfiles } from "@/lib/db/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: { student: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found", code: "NOT_FOUND" }, { status: 404 });
    }

    // Students can only update their own bookings
    if (session.user.role !== "admin") {
      const profile = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, session.user.id),
      });
      if (!profile || booking.studentId !== profile.id) {
        return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
      }
    }

    const allowedFields =
      session.user.role === "admin"
        ? ["status", "scheduledAt", "instructorId", "instructorNotes", "cancellationReason", "cancelledAt"]
        : ["status", "cancellationReason"];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field];
    }

    if (body.status === "cancelled" && !updates.cancelledAt) {
      updates.cancelledAt = new Date();
    }

    const [updated] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error("[bookings PATCH]", { id, err });
    return NextResponse.json({ error: "Update failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found", code: "NOT_FOUND" }, { status: 404 });
    }

    // Check cancellation window (48 hours)
    if (session.user.role !== "admin") {
      const profile = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, session.user.id),
      });
      if (!profile || booking.studentId !== profile.id) {
        return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
      }
      const hoursUntil = (new Date(booking.scheduledAt).getTime() - Date.now()) / 3600000;
      if (hoursUntil < 48) {
        return NextResponse.json(
          { error: "Cannot cancel within 48 hours of lesson", code: "TOO_LATE" },
          { status: 400 }
        );
      }
    }

    await db
      .update(bookings)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(eq(bookings.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[bookings DELETE]", { id, err });
    return NextResponse.json({ error: "Cancellation failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
