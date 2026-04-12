import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { schoolSettings } from "@/lib/db/schema";
import { z } from "zod";

const schema = z.object({
  schoolName: z.string().min(1),
  tagline: z.string().nullable().optional(),
  contactEmail: z.string().email(),
  phone: z.string().min(1),
  addressLine1: z.string(),
  addressLine2: z.string().nullable().optional(),
  city: z.string().min(1),
  postcode: z.string(),
  websiteUrl: z.string().url().nullable().optional().or(z.literal("")),
  facebookUrl: z.string().url().nullable().optional().or(z.literal("")),
  instagramUrl: z.string().url().nullable().optional().or(z.literal("")),
  twitterUrl: z.string().url().nullable().optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let settings = await db.query.schoolSettings.findFirst({
    where: eq(schoolSettings.id, 1),
  });

  if (!settings) {
    // Auto-create the singleton row if it doesn't exist
    [settings] = await db.insert(schoolSettings).values({ id: 1 }).returning();
  }

  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const [updated] = await db
      .insert(schoolSettings)
      .values({ id: 1, ...data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: schoolSettings.id,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();

    return NextResponse.json({ settings: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[admin/settings PATCH]", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
