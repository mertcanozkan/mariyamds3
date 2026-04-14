import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { studentProfiles, courses, instructors } from "@/lib/db/schema";
import { BookingForm } from "@/components/dashboard/booking-form";

export default async function BookPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, session.user.id),
  });
  if (!profile) redirect("/register/student");

  const [activeCourses, activeInstructors] = await Promise.all([
    db.query.courses.findMany({
      where: eq(courses.isActive, true),
      orderBy: (c, { asc }) => [asc(c.pricePerHourPence)],
    }),
    db.query.instructors.findMany({
      where: eq(instructors.isActive, true),
      orderBy: (i, { asc }) => [asc(i.firstName)],
    }),
  ]);

  return (
    <div className="lg:pt-0 pt-14 max-w-2xl">
      <h1 className="font-playfair text-2xl font-bold text-navy mb-6">Book a Lesson</h1>
      <BookingForm
        courses={activeCourses}
        instructors={activeInstructors}
        studentId={profile.id}
      />
    </div>
  );
}
