import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { promotions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  description: z.string().min(1),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().int().positive(),
  minOrderPence: z.number().int().min(0).default(0),
  maxUsages: z.number().int().positive().nullable().optional(),
  validFrom: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const all = await db.select().from(promotions).orderBy(desc(promotions.createdAt));
  return NextResponse.json({ promotions: all });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const [promo] = await db.insert(promotions).values({
      ...data,
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
    }).returning();

    return NextResponse.json({ promotion: promo }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message, code: "VALIDATION_ERROR" }, { status: 400 });
    }
    console.error("[admin/promotions POST]", err);
    return NextResponse.json({ error: "Failed to create promotion", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
