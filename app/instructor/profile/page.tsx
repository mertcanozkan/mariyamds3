import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { instructors } from "@/lib/db/schema";
import { InstructorProfileForm } from "@/components/instructor/profile-form";
import { InstructorPortalHeader } from "@/components/instructor/portal-header";

export default async function InstructorProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const instructor = await db.query.instructors.findFirst({
    where: eq(instructors.userId, session.user.id),
  });

  if (!instructor) redirect("/instructor/pending");
  if (!instructor.isActive) redirect("/instructor/pending");

  return (
    <div className="min-h-screen bg-slate-50">
      <InstructorPortalHeader firstName={instructor.firstName} />

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="font-playfair text-2xl font-bold text-navy mb-6">My Profile</h2>
        <InstructorProfileForm
          instructor={{
            firstName:             instructor.firstName,
            lastName:              instructor.lastName,
            phone:                 instructor.phone,
            bio:                   instructor.bio,
            dvsaAdiNumber:         instructor.dvsaAdiNumber,
            photoUrl:              instructor.photoUrl,
            specialisations:       instructor.specialisations,
            availableFrom:         instructor.availableFrom,
            availableTo:           instructor.availableTo,
            workingDays:           instructor.workingDays,
            vehicleMake:           instructor.vehicleMake,
            vehicleModel:          instructor.vehicleModel,
            vehicleYear:           instructor.vehicleYear,
            vehicleColour:         instructor.vehicleColour,
            vehicleRegistration:   instructor.vehicleRegistration,
            vehicleTransmission:   instructor.vehicleTransmission,
            insuranceProvider:     instructor.insuranceProvider,
            insurancePolicyNumber: instructor.insurancePolicyNumber,
            insuranceExpiryDate:   instructor.insuranceExpiryDate,
            insuranceDocumentUrl:  instructor.insuranceDocumentUrl,
          }}
          email={session.user.email!}
        />
      </main>
    </div>
  );
}
