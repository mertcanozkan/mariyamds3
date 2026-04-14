import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { studentProfiles } from "@/lib/db/schema";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "instructor") redirect("/instructor/dashboard");

  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, session.user.id),
  });
  if (!profile) redirect("/register/student");

  return (
    <div className="lg:pt-0 pt-14 max-w-2xl space-y-6">
      <h1 className="font-playfair text-2xl font-bold text-navy">Profile</h1>
      <ProfileForm
        profile={{
          ...profile,
          profilePhotoUrl: profile.profilePhotoUrl ?? null,
        }}
        email={session.user.email!}
      />
    </div>
  );
}
