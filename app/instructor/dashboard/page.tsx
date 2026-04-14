import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { instructors, bookings, bookingRejections } from "@/lib/db/schema";
import { eq, and, isNull, or, count } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, Inbox } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { BookingActions } from "@/components/instructor/booking-actions";
import { LessonCard } from "@/components/instructor/lesson-card";
import { InstructorPortalHeader } from "@/components/instructor/portal-header";

export default async function InstructorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const instructor = await db.query.instructors.findFirst({
    where: eq(instructors.userId, session.user.id),
  });

  if (!instructor) redirect("/instructor/pending");
  if (!instructor.isActive) redirect("/instructor/pending");

  // IDs of bookings this instructor has already rejected
  const myRejections = await db
    .select({ bookingId: bookingRejections.bookingId })
    .from(bookingRejections)
    .where(eq(bookingRejections.instructorId, instructor.id));

  const rejectedIds = new Set(myRejections.map((r) => r.bookingId));

  // Pending requests: assigned to me OR unassigned (and I haven't rejected them)
  const allPendingCandidates = await db.query.bookings.findMany({
    where: and(
      eq(bookings.status, "pending"),
      or(eq(bookings.instructorId, instructor.id), isNull(bookings.instructorId))
    ),
    with: { student: true, course: true },
    orderBy: (b, { asc }) => [asc(b.scheduledAt)],
  });

  const pendingRequests = allPendingCandidates.filter((b) => !rejectedIds.has(b.id));

  // Confirmed/active lessons assigned to me
  const [confirmedBookings, totalStat] = await Promise.all([
    db.query.bookings.findMany({
      where: and(
        eq(bookings.instructorId, instructor.id),
        or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "change_requested"),
          eq(bookings.status, "cancellation_requested"),
        )
      ),
      with: { student: true, course: true },
      orderBy: (b, { asc }) => [asc(b.scheduledAt)],
    }),
    db.select({ total: count() })
      .from(bookings)
      .where(eq(bookings.instructorId, instructor.id)),
  ]);

  const totalLessons = totalStat[0]?.total ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <InstructorPortalHeader firstName={instructor.firstName} />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Pending Requests", value: pendingRequests.length, icon: Inbox },
            { label: "Upcoming Lessons", value: confirmedBookings.length, icon: Calendar },
            { label: "Total Lessons", value: totalLessons, icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-amber" />
                </div>
                <div>
                  <div className="font-bold text-navy text-lg leading-tight">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Pending booking requests ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Inbox className="h-4 w-4 text-amber" />
            <h2 className="font-semibold text-navy">Booking Requests</h2>
            {pendingRequests.length > 0 && (
              <Badge variant="warning" className="text-xs">{pendingRequests.length}</Badge>
            )}
          </div>

          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No pending booking requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((booking) => (
                <Card key={booking.id} className="border-amber/30 bg-amber/5">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber/10 flex flex-col items-center justify-center flex-shrink-0">
                      <div className="text-xs text-amber/70">
                        {new Date(booking.scheduledAt).toLocaleDateString("en-GB", { weekday: "short" })}
                      </div>
                      <div className="font-bold text-amber text-lg leading-none">
                        {new Date(booking.scheduledAt).getDate()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-navy text-sm">
                        {booking.student.firstName} {booking.student.lastName}
                      </div>
                      <div className="text-muted-foreground text-xs mt-0.5">
                        {formatDateTime(booking.scheduledAt)} · {booking.durationMinutes} min
                      </div>
                      {booking.locationPickup && (
                        <div className="text-muted-foreground text-xs truncate">{booking.locationPickup}</div>
                      )}
                      {booking.course && (
                        <div className="text-muted-foreground text-xs">{booking.course.name}</div>
                      )}
                    </div>
                    <BookingActions bookingId={booking.id} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ── Upcoming confirmed lessons ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-navy/60" />
            <h2 className="font-semibold text-navy">Upcoming Lessons</h2>
            <span className="text-xs text-muted-foreground">({confirmedBookings.length})</span>
          </div>

          {confirmedBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No upcoming lessons</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {confirmedBookings.map((booking) => (
                <LessonCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
