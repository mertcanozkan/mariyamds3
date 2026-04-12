import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { instructors, users } from "@/lib/db/schema";
import { z } from "zod";

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  dvsaAdiNumber: z.string().optional(),
  bio: z.string().nullable().optional(),
  specialisations: z.array(z.string()).optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  workingDays: z.array(z.number()).optional(),
  isActive: z.boolean().optional(),
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

    const [updated] = await db.update(instructors).set(data).where(eq(instructors.id, id)).returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
    }

    // Keep user name in sync
    if (data.firstName || data.lastName) {
      const name = `${data.firstName ?? updated.firstName} ${data.lastName ?? updated.lastName}`;
      await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, updated.userId));
    }

    return NextResponse.json({ instructor: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message, code: "VALIDATION_ERROR" }, { status: 400 });
    }
    console.error("[admin/instructors/:id PATCH]", err);
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
    const instructor = await db.query.instructors.findFirst({ where: eq(instructors.id, id) });
    if (!instructor) {
      return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
    }

    // Cascade: deleting the user cascades to the instructor row
    await db.delete(users).where(eq(users.id, instructor.userId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/instructors/:id DELETE]", err);
    return NextResponse.json({ error: "Delete failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
