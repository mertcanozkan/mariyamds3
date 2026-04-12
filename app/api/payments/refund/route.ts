import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const { paymentId, amountPence } = await req.json();

    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, paymentId),
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found", code: "NOT_FOUND" }, { status: 404 });
    }

    if (!payment.stripePaymentIntentId) {
      return NextResponse.json({ error: "No Stripe payment intent", code: "NO_STRIPE_PI" }, { status: 400 });
    }

    const refundAmount = amountPence ?? payment.amountPence;

    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: refundAmount,
    });

    const isPartial = refundAmount < payment.amountPence;
    await db
      .update(payments)
      .set({
        status: isPartial ? "partially_refunded" : "refunded",
        refundedAt: new Date(),
        refundAmountPence: refundAmount,
      })
      .where(eq(payments.id, paymentId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[payments/refund POST]", err);
    return NextResponse.json({ error: "Refund failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
