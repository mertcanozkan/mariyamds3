import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, instructors } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const all = await db.query.instructors.findMany({
    with: { user: true },
    orderBy: (i, { asc }) => [asc(i.firstName)],
  });
  return NextResponse.json({ instructors: all });
}

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  dvsaAdiNumber: z.string().min(1),
  bio: z.string().optional(),
  specialisations: z.array(z.string()).default([]),
  availableFrom: z.string().default("08:00"),
  availableTo: z.string().default("18:00"),
  workingDays: z.array(z.number()).default([1, 2, 3, 4, 5]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const hash = await bcrypt.hash(data.password, 12);

    const [user] = await db.insert(users).values({
      email: data.email,
      passwordHash: hash,
      role: "instructor",
      name: `${data.firstName} ${data.lastName}`,
    }).returning();

    const [instructor] = await db.insert(instructors).values({
      userId: user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      dvsaAdiNumber: data.dvsaAdiNumber,
      bio: data.bio ?? null,
      specialisations: data.specialisations,
      availableFrom: data.availableFrom,
      availableTo: data.availableTo,
      workingDays: data.workingDays,
    }).returning();

    return NextResponse.json({ instructor }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message, code: "VALIDATION_ERROR" }, { status: 400 });
    }
    console.error("[admin/instructors POST]", err);
    return NextResponse.json({ error: "Failed to create instructor", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
