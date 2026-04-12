import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["hourly", "package", "intensive"]).optional(),
  pricePence: z.number().int().positive().optional(),
  pricePerHourPence: z.number().int().positive().nullable().optional(),
  hoursIncluded: z.number().int().positive().nullable().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updates: typeof data & { slug?: string } = { ...data };
    if (data.name) updates.slug = slugify(data.name);

    const [updated] = await db.update(courses).set(updates).where(eq(courses.id, id)).returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ course: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message, code: "VALIDATION_ERROR" }, { status: 400 });
    }
    console.error("[admin/courses/:id PATCH]", err);
    return NextResponse.json({ error: "Update failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const [deleted] = await db.delete(courses).where(eq(courses.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/courses/:id DELETE]", err);
    return NextResponse.json({ error: "Delete failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
