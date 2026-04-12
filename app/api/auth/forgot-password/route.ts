import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { resend, FROM_EMAIL, SCHOOL_NAME } from "@/lib/resend";
import PasswordResetEmail from "@/emails/password-reset";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required", code: "MISSING_EMAIL" },
        { status: 400 }
      );
    }

    // Always return 200 to prevent user enumeration
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

      after(async () => {
        await resend.emails.send({
          from: `${SCHOOL_NAME} <${FROM_EMAIL}>`,
          to: user.email,
          subject: "Reset your password",
          react: PasswordResetEmail({ resetUrl }),
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json(
      { error: "Request failed", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
