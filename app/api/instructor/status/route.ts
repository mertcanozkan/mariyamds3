import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { instructors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const instructor = await db.query.instructors.findFirst({
    where: eq(instructors.userId, session.user.id),
    columns: { isActive: true },
  });

  return NextResponse.json({ isActive: instructor?.isActive ?? false });
}
