import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { instructors } from "@/lib/db/schema";
import { z } from "zod";

// Treat empty strings as absent for optional fields
const optStr  = z.string().optional().transform(v => v === "" ? undefined : v);
const optDate = z.string().optional().transform(v => v === "" ? null : (v ?? null));

const schema = z.object({
  firstName:             z.string().min(1),
  lastName:              z.string().min(1),
  phone:                 z.string().min(1),
  bio:                   optStr,
  specialisations:       z.array(z.string()).optional(),
  availableFrom:         z.string().regex(/^\d{2}:\d{2}$/),
  availableTo:           z.string().regex(/^\d{2}:\d{2}$/),
  workingDays:           z.array(z.number().int().min(0).max(6)),
  // Vehicle
  vehicleMake:           optStr,
  vehicleModel:          optStr,
  vehicleYear:           z.number().int().min(1990).max(new Date().getFullYear() + 1).nullable().optional(),
  vehicleColour:         optStr,
  vehicleRegistration:   optStr,
  vehicleTransmission:   z.enum(["manual", "automatic"]).nullable().optional(),
  // Insurance
  insuranceProvider:     optStr,
  insurancePolicyNumber: optStr,
  insuranceExpiryDate:   optDate,
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      console.error("[instructor profile] validation error", parsed.error.flatten());
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const {
      firstName, lastName, phone, bio, specialisations, availableFrom, availableTo, workingDays,
      vehicleMake, vehicleModel, vehicleYear, vehicleColour, vehicleRegistration, vehicleTransmission,
      insuranceProvider, insurancePolicyNumber, insuranceExpiryDate,
    } = parsed.data;

    await db.update(instructors)
      .set({
        firstName, lastName, phone,
        bio:                   bio                   ?? null,
        specialisations:       specialisations       ?? [],
        availableFrom, availableTo, workingDays,
        vehicleMake:           vehicleMake           ?? null,
        vehicleModel:          vehicleModel          ?? null,
        vehicleYear:           vehicleYear           ?? null,
        vehicleColour:         vehicleColour         ?? null,
        vehicleRegistration:   vehicleRegistration   ?? null,
        vehicleTransmission:   vehicleTransmission   ?? null,
        insuranceProvider:     insuranceProvider     ?? null,
        insurancePolicyNumber: insurancePolicyNumber ?? null,
        insuranceExpiryDate:   insuranceExpiryDate,
      })
      .where(eq(instructors.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[instructor profile] PATCH error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
