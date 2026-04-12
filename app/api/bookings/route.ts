import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, studentProfiles, courses, instructors } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { resend, FROM_EMAIL, SCHOOL_NAME } from "@/lib/resend";
import BookingConfirmationEmail from "@/emails/booking-confirmation";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  if (session.user.role === "admin") {
    const all = await db.query.bookings.findMany({
      with: {
        student: true,
        instructor: true,
        course: true,
        payment: true,
      },
      orderBy: (b, { desc }) => [desc(b.scheduledAt)],
      limit,
      offset,
    });
    return NextResponse.json({ bookings: all });
  }

  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, session.user.id),
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found", code: "NO_PROFILE" }, { status: 404 });
  }

  const studentBookings = await db.query.bookings.findMany({
    where: eq(bookings.studentId, profile.id),
    with: { instructor: true, course: true, payment: true },
    orderBy: (b, { desc }) => [desc(b.scheduledAt)],
    limit,
    offset,
  });

  return NextResponse.json({ bookings: studentBookings });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { instructorId, courseId, scheduledAt, durationMinutes, locationPickup, lessonType, notes } = body;

    const profile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, session.user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Student profile not found", code: "NO_PROFILE" }, { status: 404 });
    }

    const instructor = await db.query.instructors.findFirst({
      where: and(eq(instructors.id, instructorId), eq(instructors.isActive, true)),
    });

    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found", code: "NO_INSTRUCTOR" }, { status: 404 });
    }

    let amountPence = Math.round((durationMinutes / 60) * 3500);
    let description = `${durationMinutes}-minute driving lesson`;

    if (courseId) {
      const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
      if (course) {
        amountPence = course.pricePence;
        description = course.name;
      }
    }

    // Create a pending booking
    const [booking] = await db
      .insert(bookings)
      .values({
        studentId: profile.id,
        instructorId,
        courseId: courseId || null,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: parseInt(durationMinutes),
        locationPickup,
        lessonType: lessonType || "standard",
        studentNotes: notes || null,
        status: "pending",
      })
      .returning();

    // Skip Stripe if key is a placeholder (dev mode — booking saved as pending)
    const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
    if (stripeKey === "sk_test_placeholder" || (!stripeKey.startsWith("sk_test_") && !stripeKey.startsWith("sk_live_"))) {
      return NextResponse.json({ bookingId: booking.id, checkoutUrl: null });
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: description,
              description: `With ${instructor.firstName} ${instructor.lastName} on ${new Date(scheduledAt).toLocaleDateString("en-GB")}`,
            },
            unit_amount: amountPence,
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId: booking.id, studentId: profile.id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/book?cancelled=true`,
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.url, bookingId: booking.id });
  } catch (err) {
    console.error("[bookings POST]", err);
    return NextResponse.json({ error: "Booking failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
