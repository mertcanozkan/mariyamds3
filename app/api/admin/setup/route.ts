import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, adminProfiles } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only allow if profile doesn't exist yet (one-time setup)
  const existing = await db.query.adminProfiles.findFirst({
    where: eq(adminProfiles.userId, session.user.id),
  });
  if (existing) {
    return NextResponse.json({ error: "Profile already set up" }, { status: 409 });
  }

  try {
    const { name, title, phone, newPassword } = await req.json();

    if (!name || !title) {
      return NextResponse.json({ error: "Name and title are required" }, { status: 400 });
    }

    // Create admin profile
    await db.insert(adminProfiles).values({
      userId: session.user.id,
      name: name.trim(),
      title: title.trim(),
      phone: phone?.trim() || null,
    });

    // Update display name on the users row
    await db.update(users)
      .set({ name: name.trim(), updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    // Optionally update password
    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 12);
      await db.update(users)
        .set({ passwordHash: hash, updatedAt: new Date() })
        .where(eq(users.id, session.user.id));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/setup]", err);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
