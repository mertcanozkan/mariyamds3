import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "instructor") redirect("/dashboard");

  return <>{children}</>;
}
