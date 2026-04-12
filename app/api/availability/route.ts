import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte, lte, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, instructors, availabilityBlocks, type Booking, type AvailabilityBlock } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const instructorId = searchParams.get("instructorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!instructorId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "instructorId, startDate, endDate required", code: "MISSING_PARAMS" },
        { status: 400 }
      );
    }

    const instructor = await db.query.instructors.findFirst({
      where: and(eq(instructors.id, instructorId), eq(instructors.isActive, true)),
    });

    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found", code: "NOT_FOUND" }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get booked slots
    const bookedSlots = await db.query.bookings.findMany({
      where: and(
        eq(bookings.instructorId, instructorId),
        gte(bookings.scheduledAt, start),
        lte(bookings.scheduledAt, end),
        or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "pending")
        )
      ),
    });

    // Get blocked times
    const blocks = await db.query.availabilityBlocks.findMany({
      where: and(
        eq(availabilityBlocks.instructorId, instructorId),
        gte(availabilityBlocks.startAt, start),
        lte(availabilityBlocks.endAt, end)
      ),
    });

    // Generate 1-hour slots for each working day
    const [fromHour] = (instructor.availableFrom ?? "08:00").split(":").map(Number);
    const [toHour] = (instructor.availableTo ?? "18:00").split(":").map(Number);
    const workingDays = instructor.workingDays ?? [1, 2, 3, 4, 5];

    const slots: { datetime: string; available: boolean }[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const dayOfWeek = cursor.getDay();
      if (workingDays.includes(dayOfWeek)) {
        for (let hour = fromHour; hour < toHour; hour++) {
          const slotStart = new Date(cursor);
          slotStart.setHours(hour, 0, 0, 0);
          const slotEnd = new Date(slotStart);
          slotEnd.setHours(hour + 1);

          // Skip past slots
          if (slotStart < new Date()) {
            slots.push({ datetime: slotStart.toISOString(), available: false });
            continue;
          }

          const isBooked = bookedSlots.some((b: Booking) => {
            const bStart = new Date(b.scheduledAt);
            const bEnd = new Date(bStart.getTime() + b.durationMinutes * 60000);
            return slotStart < bEnd && slotEnd > bStart;
          });

          const isBlocked = blocks.some((b: AvailabilityBlock) => slotStart < b.endAt && slotEnd > b.startAt);

          slots.push({ datetime: slotStart.toISOString(), available: !isBooked && !isBlocked });
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return NextResponse.json({ slots });
  } catch (err) {
    console.error("[availability GET]", err);
    return NextResponse.json({ error: "Failed to fetch availability", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
