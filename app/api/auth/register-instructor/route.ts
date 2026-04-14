import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, instructors } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      passwordHash: rawPassword,
      firstName,
      lastName,
      phone,
      dvsaAdiNumber,
      bio,
    } = body;

    if (!email || !rawPassword || !firstName || !lastName || !phone || !dvsaAdiNumber) {
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

    // Check for duplicate ADI number
    const existingAdi = await db.query.instructors.findFirst({
      where: eq(instructors.dvsaAdiNumber, dvsaAdiNumber.trim()),
    });
    if (existingAdi) {
      return NextResponse.json(
        { error: "An instructor with this ADI number is already registered", code: "ADI_EXISTS" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(rawPassword, 12);

    // Create user with instructor role
    const [user] = await db
      .insert(users)
      .values({ email: email.toLowerCase(), passwordHash: hash, role: "instructor" })
      .returning();

    try {
      await db.insert(instructors).values({
        userId: user.id,
        firstName,
        lastName,
        phone,
        dvsaAdiNumber: dvsaAdiNumber.trim(),
        bio: bio?.trim() || null,
        isActive: false,
        pendingApproval: true,
      });
    } catch (profileErr) {
      // Roll back user row if instructor insert fails
      await db.delete(users).where(eq(users.id, user.id));
      throw profileErr;
    }

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err) {
    console.error("[register-instructor]", err);
    return NextResponse.json(
      { error: "Registration failed", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
