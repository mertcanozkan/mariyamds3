import { NextRequest, NextResponse } from "next/server";
import { eq, and, gt, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.usedAt)
      ),
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired token", code: "INVALID_TOKEN" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 12);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash: hash, updatedAt: new Date() })
        .where(eq(users.id, resetToken.userId));

      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, resetToken.id));
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json(
      { error: "Reset failed", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
