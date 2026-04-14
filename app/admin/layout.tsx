import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { db } from "@/lib/db";
import { instructors, adminProfiles } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  // First-time admin: redirect to profile setup (exempt the setup page itself)
  const adminProfile = await db.query.adminProfiles.findFirst({
    where: eq(adminProfiles.userId, session.user.id),
  });

  const [{ total: pendingInstructors }] = await db
    .select({ total: count() })
    .from(instructors)
    .where(eq(instructors.pendingApproval, true));

  if (!adminProfile) {
    // Allow the setup page itself to render without redirect loop
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar
        user={{ ...session.user, name: adminProfile.name }}
        pendingInstructors={pendingInstructors}
      />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  );
}
