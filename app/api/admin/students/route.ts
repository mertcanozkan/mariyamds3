import { NextRequest, NextResponse } from "next/server";
import { ilike, or, count, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { studentProfiles } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 25;
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") ?? "";

    const where = search
      ? or(
          ilike(studentProfiles.firstName, `%${search}%`),
          ilike(studentProfiles.lastName, `%${search}%`),
          ilike(studentProfiles.postcode, `%${search}%`)
        )
      : undefined;

    const [students, [{ total }]] = await Promise.all([
      db.query.studentProfiles.findMany({
        where,
        with: { user: true, bookings: { with: { payment: true } } },
        orderBy: (s, { desc }) => [desc(s.createdAt)],
        limit,
        offset,
      }),
      db.select({ total: count() }).from(studentProfiles),
    ]);

    return NextResponse.json({ students, total, page, limit });
  } catch (err) {
    console.error("[admin/students GET]", err);
    return NextResponse.json({ error: "Failed to fetch students", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
