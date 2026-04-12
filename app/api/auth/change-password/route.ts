import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised", code: "UNAUTHORISED" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current and new password are required", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters with one uppercase letter and one number", code: "WEAK_PASSWORD" },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: "No password set on this account (sign in with Google instead)", code: "NO_PASSWORD" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect", code: "WRONG_PASSWORD" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash: hash, updatedAt: new Date() }).where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[change-password]", err);
    return NextResponse.json({ error: "Request failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
