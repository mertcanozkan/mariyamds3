import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { studentProfiles } from "@/lib/db/schema";
import { resend, FROM_EMAIL, SCHOOL_NAME } from "@/lib/resend";
import WelcomeEmail from "@/emails/welcome";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
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

    if (!firstName || !lastName || !phone || !addressLine1 || !city || !postcode) {
      return NextResponse.json(
        { error: "Missing required fields", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const [profile] = await db
      .insert(studentProfiles)
      .values({
        userId: session.user.id,
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

    after(async () => {
      if (session.user?.email) {
        await resend.emails.send({
          from: `${SCHOOL_NAME} <${FROM_EMAIL}>`,
          to: session.user.email,
          subject: "Welcome to Mariyam Driving School",
          react: WelcomeEmail({ firstName }),
        });
      }
    });

    return NextResponse.json({ success: true, profileId: profile.id }, { status: 201 });
  } catch (err) {
    console.error("[complete-profile]", err);
    return NextResponse.json(
      { error: "Failed to create profile", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
