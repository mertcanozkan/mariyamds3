import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { instructors, bookings, bookingRejections } from "@/lib/db/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const instructor = await db.query.instructors.findFirst({
    where: eq(instructors.userId, session.user.id),
    columns: { id: true, isActive: true },
  });

  if (!instructor?.isActive) {
    return NextResponse.json({ error: "Inactive instructor" }, { status: 403 });
  }

  const { id: bookingId } = await params;
  const body = await req.json();
  const { action } = body;

  // ── Accept / Reject pending bookings ─────────────────────────────────────
  if (action === "accept" || action === "reject") {
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        eq(bookings.status, "pending"),
        or(
          eq(bookings.instructorId, instructor.id),
          isNull(bookings.instructorId)
        )
      ),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or not accessible" }, { status: 404 });
    }

    if (action === "accept") {
      await db.update(bookings)
        .set({ instructorId: instructor.id, status: "confirmed" })
        .where(eq(bookings.id, bookingId));
      return NextResponse.json({ success: true, status: "confirmed" });
    }

    // reject — clear instructor assignment, record rejection
    await db.update(bookings)
      .set({ instructorId: null })
      .where(eq(bookings.id, bookingId));

    await db.insert(bookingRejections)
      .values({ bookingId, instructorId: instructor.id })
      .onConflictDoNothing();

    return NextResponse.json({ success: true, status: "pending" });
  }

  // ── Update lesson outcome ─────────────────────────────────────────────────
  if (action === "set_status") {
    const { status, rescheduledTo } = body as {
      status: "completed" | "cancelled" | "no_show" | "rescheduled";
      rescheduledTo?: string;
    };

    const allowed = ["completed", "cancelled", "no_show", "rescheduled"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (status === "rescheduled" && !rescheduledTo) {
      return NextResponse.json({ error: "rescheduledTo is required for rescheduled status" }, { status: 400 });
    }

    // Booking must belong to this instructor and be in an active state
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        eq(bookings.instructorId, instructor.id),
        or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "change_requested"),
          eq(bookings.status, "cancellation_requested"),
        )
      ),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or not accessible" }, { status: 404 });
    }

    await db.update(bookings)
      .set({
        status,
        ...(status === "rescheduled" && rescheduledTo
          ? { rescheduledTo: new Date(rescheduledTo) }
          : {}),
        ...(status === "cancelled" ? { cancelledAt: new Date() } : {}),
      })
      .where(eq(bookings.id, bookingId));

    return NextResponse.json({ success: true, status });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
