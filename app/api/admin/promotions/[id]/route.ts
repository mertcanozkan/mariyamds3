import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { promotions } from "@/lib/db/schema";
import { z } from "zod";

const updateSchema = z.object({
  code: z.string().min(1).optional(),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]).optional(),
  discountValue: z.number().int().positive().optional(),
  minOrderPence: z.number().int().min(0).optional(),
  maxUsages: z.number().int().positive().nullable().optional(),
  validFrom: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
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

    const updates: Record<string, unknown> = { ...data };
    if ("validFrom" in data) updates.validFrom = data.validFrom ? new Date(data.validFrom) : null;
    if ("validUntil" in data) updates.validUntil = data.validUntil ? new Date(data.validUntil) : null;

    const [updated] = await db.update(promotions).set(updates).where(eq(promotions.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ promotion: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message, code: "VALIDATION_ERROR" }, { status: 400 });
    }
    console.error("[admin/promotions/:id PATCH]", err);
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
    const [deleted] = await db.delete(promotions).where(eq(promotions.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/promotions/:id DELETE]", err);
    return NextResponse.json({ error: "Delete failed", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
