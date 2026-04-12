import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { z } from "zod";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const all = await db.query.courses.findMany({
    orderBy: (c, { asc }) => [asc(c.displayOrder)],
  });
  return NextResponse.json({ courses: all });
}

const courseSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["hourly", "package", "intensive"]),
  pricePence: z.number().int().positive(),
  pricePerHourPence: z.number().int().positive().nullable().optional(),
  hoursIncluded: z.number().int().positive().nullable().optional(),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = courseSchema.parse(body);
    const slug = slugify(data.name);

    const [course] = await db.insert(courses).values({ ...data, slug }).returning();
    return NextResponse.json({ course }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message, code: "VALIDATION_ERROR" }, { status: 400 });
    }
    console.error("[admin/courses POST]", err);
    return NextResponse.json({ error: "Failed to create course", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
