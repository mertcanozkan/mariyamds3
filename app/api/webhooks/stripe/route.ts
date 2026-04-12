import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { bookings, payments } from "@/lib/db/schema";
import { resend, FROM_EMAIL, SCHOOL_NAME } from "@/lib/resend";
import BookingConfirmationEmail from "@/emails/booking-confirmation";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { bookingId, studentId } = session.metadata ?? {};

        if (!bookingId || !studentId) break;

        await db.transaction(async (tx) => {
          await tx
            .update(bookings)
            .set({ status: "confirmed" })
            .where(eq(bookings.id, bookingId));

          await tx.insert(payments).values({
            studentId,
            bookingId,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            amountPence: session.amount_total ?? 0,
            status: "paid",
            description: session.metadata?.description ?? "Driving lesson",
            paidAt: new Date(),
          });
        });

        after(async () => {
          const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
            with: { student: { with: { user: true } }, instructor: true },
          });

          if (booking?.student?.user?.email) {
            await resend.emails.send({
              from: `${SCHOOL_NAME} <${FROM_EMAIL}>`,
              to: booking.student.user.email,
              subject: "Booking Confirmed",
              react: BookingConfirmationEmail({
                firstName: booking.student.firstName,
                instructorName: `${booking.instructor.firstName} ${booking.instructor.lastName}`,
                scheduledAt: booking.scheduledAt,
                durationMinutes: booking.durationMinutes,
                locationPickup: booking.locationPickup,
              }),
            });
          }
        });

        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        await db
          .update(payments)
          .set({ status: "failed" })
          .where(eq(payments.stripePaymentIntentId, pi.id));
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const piId = charge.payment_intent as string;
        if (piId) {
          await db
            .update(payments)
            .set({
              status: "refunded",
              refundedAt: new Date(),
              refundAmountPence: charge.amount_refunded,
            })
            .where(eq(payments.stripePaymentIntentId, piId));
        }
        break;
      }

      default:
        // Unhandled event — acknowledged
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe webhook] handler error", { type: event.type, err });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
