import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { payments, studentProfiles } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    if (session.user.role === "admin") {
      const all = await db.query.payments.findMany({
        with: { student: true, booking: { with: { instructor: true } } },
        orderBy: (p, { desc }) => [desc(p.createdAt)],
        limit: 100,
      });
      return NextResponse.json({ payments: all });
    }

    const profile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, session.user.id),
    });

    if (!profile) {
      return NextResponse.json({ payments: [] });
    }

    const studentPayments = await db.query.payments.findMany({
      where: eq(payments.studentId, profile.id),
      with: { booking: { with: { instructor: true } } },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });

    return NextResponse.json({ payments: studentPayments });
  } catch (err) {
    console.error("[payments GET]", err);
    return NextResponse.json({ error: "Failed to fetch payments", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
