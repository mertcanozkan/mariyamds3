import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";

// POST /api/bookings/[id]/change-request
// Body: { action: 'confirm' | 'reject' }
// Admin only — confirms or rejects a student's change request
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { action } = await req.json();
    if (action !== "confirm" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action", code: "INVALID_ACTION" }, { status: 400 });
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found", code: "NOT_FOUND" }, { status: 404 });
    }

    if (booking.status !== "change_requested") {
      return NextResponse.json(
        { error: "Booking has no pending change request", code: "NO_CHANGE_REQUEST" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      status: "confirmed",
      proposedScheduledAt: null,
      proposedDurationMinutes: null,
      changeRequestNote: null,
      changeRequestedAt: null,
    };

    if (action === "confirm") {
      // Apply the proposed values
      if (booking.proposedScheduledAt) updates.scheduledAt = booking.proposedScheduledAt;
      if (booking.proposedDurationMinutes) updates.durationMinutes = booking.proposedDurationMinutes;
    }
    // For 'reject': just clear the proposed fields and revert to confirmed (no changes applied)

    const [updated] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error("[change-request POST]", { id, err });
    return NextResponse.json({ error: "Action failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
