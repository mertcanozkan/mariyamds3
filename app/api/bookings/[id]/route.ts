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

    const updates: Record<string, unknown> = {};

    if (session.user.role === "admin") {
      // Admins can update any field
      const allowedFields = [
        "status", "scheduledAt", "durationMinutes", "instructorId",
        "instructorNotes", "cancellationReason", "cancelledAt",
        "proposedScheduledAt", "proposedDurationMinutes", "changeRequestNote", "changeRequestedAt",
      ];
      for (const field of allowedFields) {
        if (field in body) updates[field] = body[field];
      }
      if (body.status === "cancelled" && !updates.cancelledAt) {
        updates.cancelledAt = new Date();
      }
    } else {
      // Students can only update their own bookings
      const profile = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, session.user.id),
      });
      if (!profile || booking.studentId !== profile.id) {
        return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
      }

      if (body.status === "cancelled") {
        // Cancellation is handled by the DELETE route — reject here
        return NextResponse.json({ error: "Use DELETE to cancel", code: "USE_DELETE" }, { status: 400 });
      } else if (["pending", "confirmed"].includes(booking.status)) {
        // All student edits go through the change request flow — instructor must approve
        if (body.proposedScheduledAt !== undefined || body.proposedDurationMinutes !== undefined) {
          updates.proposedScheduledAt = body.proposedScheduledAt
            ? new Date(body.proposedScheduledAt)
            : null;
          updates.proposedDurationMinutes = body.proposedDurationMinutes ?? null;
          updates.changeRequestNote = body.changeRequestNote ?? null;
          updates.changeRequestedAt = new Date();
          updates.status = "change_requested";
        }
      } else if (booking.status === "change_requested") {
        // Allow student to withdraw their pending change request
        if (body.cancelChangeRequest === true) {
          updates.status = "pending";
          updates.proposedScheduledAt = null;
          updates.proposedDurationMinutes = null;
          updates.changeRequestNote = null;
          updates.changeRequestedAt = null;
        }
      } else if (booking.status === "cancellation_requested") {
        // Allow student to withdraw their pending cancellation request
        if (body.cancelCancellationRequest === true) {
          updates.status = "confirmed";
          updates.cancellationReason = null;
          updates.cancellationRequestedAt = null;
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates", code: "NO_UPDATES" }, { status: 400 });
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

    if (session.user.role !== "admin") {
      const profile = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, session.user.id),
      });
      if (!profile || booking.studentId !== profile.id) {
        return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
      }

      const hoursUntil = (new Date(booking.scheduledAt).getTime() - Date.now()) / 3600000;

      if (hoursUntil < 48) {
        // Less than 48 hours — submit a cancellation request for instructor to approve/charge/reject
        const body = await req.json().catch(() => ({}));
        await db
          .update(bookings)
          .set({
            status: "cancellation_requested",
            cancellationReason: body.reason ?? null,
            cancellationRequestedAt: new Date(),
          })
          .where(eq(bookings.id, id));
        return NextResponse.json({ success: true, requested: true });
      }
    }

    await db
      .update(bookings)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(eq(bookings.id, id));

    return NextResponse.json({ success: true, requested: false });
  } catch (err) {
    console.error("[bookings DELETE]", { id, err });
    return NextResponse.json({ error: "Cancellation failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
