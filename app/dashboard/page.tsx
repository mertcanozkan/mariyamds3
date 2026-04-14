import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq, desc, count, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { studentProfiles, bookings, payments, lessonProgress, users } from "@/lib/db/schema";
import { formatCurrency, formatDateTime, calculateTestReadiness } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CalendarDays, TrendingUp, PoundSterling } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProgressRadarChart } from "@/components/dashboard/progress-radar";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "success",
  pending: "warning",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Instructors have their own area
  if (session.user.role === "instructor") redirect("/instructor/dashboard");

  const [profile, dbUser] = await Promise.all([
    db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, session.user.id),
    }),
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { image: true },
    }),
  ]);
  // Route all avatar images through the proxy so private blob tokens stay server-side
  // and OAuth images (Google) also benefit from a consistent URL
  const avatarUrl = dbUser?.image ? "/api/profile/avatar-url" : null;

  if (!profile) redirect("/register/student");

  // Parallel fetches — async-parallel rule
  const [upcomingBookings, recentPayments, progressRecords] = await Promise.all([
    db.query.bookings.findMany({
      where: eq(bookings.studentId, profile.id),
      with: { instructor: true, course: true },
      orderBy: (b, { asc }) => [asc(b.scheduledAt)],
      limit: 3,
    }),
    db.query.payments.findMany({
      where: eq(payments.studentId, profile.id),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit: 5,
    }),
    db.query.lessonProgress.findMany({
      where: eq(lessonProgress.studentId, profile.id),
      orderBy: (lp, { desc }) => [desc(lp.createdAt)],
    }),
  ]);

  const totalHours = progressRecords.reduce((sum, r) => sum + parseFloat(String(r.hoursLogged)), 0);
  const completedBookings = upcomingBookings.filter((b) => b.status === "completed").length;

  // Aggregate competencies for radar
  const allCompetencies: Record<string, number[]> = {};
  for (const r of progressRecords) {
    for (const [key, val] of Object.entries(r.competencies as Record<string, number>)) {
      if (!allCompetencies[key]) allCompetencies[key] = [];
      allCompetencies[key].push(val);
    }
  }
  const avgCompetencies: Record<string, number> = {};
  for (const [key, vals] of Object.entries(allCompetencies)) {
    avgCompetencies[key] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  const testReadiness = calculateTestReadiness(avgCompetencies);

  const upcoming = upcomingBookings.filter((b) => ["confirmed", "pending"].includes(b.status));

  return (
    <div className="lg:pt-0 pt-14 space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-navy to-navy-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-white/20"
                unoptimized
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/10 ring-2 ring-white/20 flex items-center justify-center">
                <span className="font-playfair font-bold text-xl text-white">
                  {profile.firstName[0]}{profile.lastName[0]}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-playfair text-2xl font-bold">
              Welcome back, {profile.firstName}!
            </h1>
            <p className="text-white/70 mt-0.5 text-sm">
              {upcoming.length > 0
                ? `You have ${upcoming.length} upcoming lesson${upcoming.length > 1 ? "s" : ""}.`
                : "No upcoming lessons — ready to book?"}
            </p>
          </div>
          <Button variant="amber" size="sm" className="flex-shrink-0 hidden sm:flex" asChild>
            <Link href="/dashboard/book">Book a Lesson</Link>
          </Button>
        </div>
        <Button variant="amber" size="sm" className="mt-4 sm:hidden w-full" asChild>
          <Link href="/dashboard/book">Book a Lesson</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Hours", value: `${totalHours.toFixed(1)}h`, icon: Clock },
          { label: "Upcoming Lessons", value: upcoming.length, icon: CalendarDays },
          { label: "Test Readiness", value: `${testReadiness}%`, icon: TrendingUp },
          { label: "Lessons Completed", value: completedBookings, icon: PoundSterling },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-amber" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming lessons */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy text-lg">Upcoming Lessons</h2>
            <Link href="/dashboard/lessons" className="text-sm text-amber hover:underline">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No upcoming lessons</p>
                <Button variant="amber" size="sm" className="mt-3" asChild>
                  <Link href="/dashboard/book">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcoming.map((booking) => (
              <Card key={booking.id} className="hover:border-amber/40 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy/5 flex flex-col items-center justify-center flex-shrink-0">
                    <div className="text-xs text-muted-foreground">
                      {new Date(booking.scheduledAt).toLocaleDateString("en-GB", { weekday: "short" })}
                    </div>
                    <div className="font-bold text-navy text-lg leading-none">
                      {new Date(booking.scheduledAt).getDate()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-navy text-sm">
                      {booking.instructor ? `${booking.instructor.firstName} ${booking.instructor.lastName}` : "Instructor TBC"}
                    </div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {formatDateTime(booking.scheduledAt)} · {booking.durationMinutes} min
                    </div>
                    <div className="text-muted-foreground text-xs truncate">{booking.locationPickup}</div>
                  </div>
                  <Badge variant={STATUS_COLORS[booking.status] as "success" | "warning" | "secondary" | "destructive"} className="capitalize flex-shrink-0">
                    {booking.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Progress radar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy text-lg">Progress</h2>
            <Link href="/dashboard/progress" className="text-sm text-amber hover:underline">Details</Link>
          </div>
          <Card>
            <CardContent className="p-4">
              {Object.keys(avgCompetencies).length > 0 ? (
                <ProgressRadarChart competencies={avgCompetencies} />
              ) : (
                <div className="h-48 flex items-center justify-center text-center">
                  <div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-xs">Complete lessons to see progress</p>
                  </div>
                </div>
              )}
              <div className="text-center mt-3">
                <div className="text-2xl font-bold text-navy">{testReadiness}%</div>
                <div className="text-xs text-muted-foreground">Test Readiness</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent payments */}
      {recentPayments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy text-lg">Recent Payments</h2>
            <Link href="/dashboard/payments" className="text-sm text-amber hover:underline">View all</Link>
          </div>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium text-sm text-navy">{payment.description}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {payment.paidAt ? formatDateTime(payment.paidAt) : "Pending"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-navy">{formatCurrency(payment.amountPence)}</div>
                    <Badge variant={payment.status === "paid" ? "success" : "warning"} className="capitalize text-xs">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
