import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { contactSchema } from "@/lib/validations/booking";
import { resend, FROM_EMAIL, SCHOOL_NAME } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = parsed.data;

    const [submission] = await db
      .insert(contactSubmissions)
      .values({ name, email, phone: phone ?? null, subject, message })
      .returning();

    after(async () => {
      // Notify admin
      await resend.emails.send({
        from: `${SCHOOL_NAME} <${FROM_EMAIL}>`,
        to: "admin@mariyamds.co.uk",
        subject: `New contact: ${subject}`,
        html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Phone:</strong> ${phone ?? "N/A"}</p><p><strong>Message:</strong></p><p>${message}</p>`,
      });
      // Auto-reply to sender
      await resend.emails.send({
        from: `${SCHOOL_NAME} <${FROM_EMAIL}>`,
        to: email,
        subject: "We received your message",
        html: `<p>Hi ${name},</p><p>Thank you for contacting Mariyam Driving School. We'll get back to you within 24 hours.</p><p>The Mariyam DS Team</p>`,
      });
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (err) {
    console.error("[contact POST]", err);
    return NextResponse.json({ error: "Submission failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
