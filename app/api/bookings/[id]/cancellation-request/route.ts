import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";

// POST /api/bookings/[id]/cancellation-request
// Body: { action: 'approve' | 'charge' | 'reject' }
// Admin only — resolves a student's late cancellation request
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
    if (!["approve", "charge", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action", code: "INVALID_ACTION" }, { status: 400 });
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found", code: "NOT_FOUND" }, { status: 404 });
    }

    if (booking.status !== "cancellation_requested") {
      return NextResponse.json(
        { error: "Booking has no pending cancellation request", code: "NO_CANCELLATION_REQUEST" },
        { status: 400 }
      );
    }

    let updates: Record<string, unknown>;

    if (action === "reject") {
      // Instructor rejects — lesson stays confirmed, request cleared
      updates = {
        status: "confirmed",
        cancellationReason: null,
        cancellationRequestedAt: null,
      };
    } else {
      // approve or charge — lesson is cancelled
      // For 'charge': admin handles the fee manually; we note it in cancellationReason
      updates = {
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationRequestedAt: null,
        ...(action === "charge" && {
          cancellationReason: booking.cancellationReason
            ? `${booking.cancellationReason} [Late cancellation fee applies]`
            : "Late cancellation fee applies",
        }),
      };
    }

    const [updated] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error("[cancellation-request POST]", { id, err });
    return NextResponse.json({ error: "Action failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
