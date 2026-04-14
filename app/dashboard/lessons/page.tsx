import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { studentProfiles, bookings, type instructors, type courses } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type BookingWithRelations = InferSelectModel<typeof bookings> & {
  instructor: InferSelectModel<typeof instructors> | null;
  course: InferSelectModel<typeof courses> | null;
};
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock } from "lucide-react";

import Link from "next/link";
import { LessonEditDialog } from "@/components/dashboard/lesson-edit-dialog";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "success",
  pending: "warning",
  change_requested: "warning",
  cancellation_requested: "warning",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  change_requested: "Change Pending",
  cancellation_requested: "Cancellation Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export default async function LessonsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, session.user.id),
  });
  if (!profile) redirect("/register/student");

  const allBookings = await db.query.bookings.findMany({
    where: eq(bookings.studentId, profile.id),
    with: { instructor: true, course: true },
    orderBy: (b, { desc }) => [desc(b.scheduledAt)],
  });

  const upcoming = allBookings.filter((b) =>
    ["confirmed", "pending", "change_requested", "cancellation_requested"].includes(b.status)
  );
  const past = allBookings.filter((b) =>
    ["completed", "cancelled", "no_show"].includes(b.status)
  );

  return (
    <div className="lg:pt-0 pt-14 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-navy">My Lessons</h1>
        <Button variant="amber" size="sm" asChild>
          <Link href="/dashboard/book">Book a Lesson</Link>
        </Button>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="font-semibold text-navy mb-3">Upcoming ({upcoming.length})</h2>
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
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="font-semibold text-navy mb-3">Past Lessons ({past.length})</h2>
          <div className="space-y-3">
            {past.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BookingRow({ booking }: { booking: BookingWithRelations }) {
  const statusColor = STATUS_COLORS[booking.status] ?? "secondary";
  const statusLabel = STATUS_LABELS[booking.status] ?? booking.status.replace("_", " ");
  const isUpcoming = ["confirmed", "pending", "change_requested", "cancellation_requested"].includes(booking.status);
  const isChangeRequested = booking.status === "change_requested";
  const isCancellationRequested = booking.status === "cancellation_requested";

  return (
    <Card className="hover:border-amber/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Date block */}
          <div className="w-12 h-12 rounded-xl bg-navy/5 flex flex-col items-center justify-center flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              {new Date(booking.scheduledAt).toLocaleDateString("en-GB", { weekday: "short" })}
            </div>
            <div className="font-bold text-navy text-lg leading-none">
              {new Date(booking.scheduledAt).getDate()}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-navy text-sm">
              {booking.instructor ? `${booking.instructor.firstName} ${booking.instructor.lastName}` : "Instructor TBC"}
            </div>
            <div className="text-muted-foreground text-xs mt-0.5">
              {formatDateTime(booking.scheduledAt)} · {booking.durationMinutes} min
            </div>
            {booking.course && (
              <div className="text-muted-foreground text-xs truncate">{booking.course.name}</div>
            )}
            <div className="text-muted-foreground text-xs truncate">{booking.locationPickup}</div>

            {/* Cancellation request summary */}
            {isCancellationRequested && (
              <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-xs text-amber-800 flex items-start gap-1.5">
                <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
                <div>
                  <span className="font-medium">Cancellation requested — </span>
                  awaiting instructor response
                  {booking.cancellationReason && (
                    <div className="mt-0.5 italic text-amber-700">&ldquo;{booking.cancellationReason}&rdquo;</div>
                  )}
                </div>
              </div>
            )}

            {/* Proposed change summary */}
            {isChangeRequested && booking.proposedScheduledAt && (
              <div className="mt-2 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-xs text-amber-800 flex items-start gap-1.5">
                <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
                <div>
                  <span className="font-medium">Requested: </span>
                  {formatDateTime(booking.proposedScheduledAt)}
                  {booking.proposedDurationMinutes && booking.proposedDurationMinutes !== booking.durationMinutes
                    ? ` · ${booking.proposedDurationMinutes} min`
                    : ""}
                  {booking.changeRequestNote && (
                    <div className="mt-0.5 text-amber-700 italic">&ldquo;{booking.changeRequestNote}&rdquo;</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right side: badge + edit */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge
              variant={statusColor as "success" | "warning" | "secondary" | "destructive"}
              className="capitalize"
            >
              {statusLabel}
            </Badge>
            {isUpcoming && (
              <LessonEditDialog
                bookingId={booking.id}
                status={booking.status as "pending" | "confirmed" | "change_requested" | "cancellation_requested"}
                scheduledAt={booking.scheduledAt.toISOString()}
                durationMinutes={booking.durationMinutes}
                proposedScheduledAt={booking.proposedScheduledAt?.toISOString() ?? null}
                proposedDurationMinutes={booking.proposedDurationMinutes ?? null}
                changeRequestNote={booking.changeRequestNote ?? null}
                cancellationReason={booking.cancellationReason ?? null}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
