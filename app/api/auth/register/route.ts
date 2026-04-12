import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, studentProfiles } from "@/lib/db/schema";
import { resend, FROM_EMAIL, SCHOOL_NAME } from "@/lib/resend";
import WelcomeEmail from "@/emails/welcome";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      passwordHash: rawPassword,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      addressLine1,
      addressLine2,
      city,
      postcode,
      provisionalLicenceNumber,
      hasPreviousLessons,
      previousLessonsHours,
    } = body;

    if (!email || !rawPassword || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered", code: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(rawPassword, 12);

    // Create user + profile in a transaction
    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email: email.toLowerCase(), passwordHash: hash, role: "student" })
        .returning();

      const [profile] = await tx
        .insert(studentProfiles)
        .values({
          userId: user.id,
          firstName,
          lastName,
          phone,
          dateOfBirth: dateOfBirth || null,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          postcode: postcode.toUpperCase(),
          provisionalLicenceNumber: provisionalLicenceNumber || null,
          hasPreviousLessons: !!hasPreviousLessons,
          previousLessonsHours: previousLessonsHours || 0,
        })
        .returning();

      return { user, profile };
    });

    // Send welcome email after responding
    after(async () => {
      await resend.emails.send({
        from: `${SCHOOL_NAME} <${FROM_EMAIL}>`,
        to: result.user.email,
        subject: "Welcome to Mariyam Driving School",
        react: WelcomeEmail({ firstName }),
      });
    });

    return NextResponse.json(
      { success: true, userId: result.user.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Registration failed", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
