import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { studentProfiles, bookings, type instructors, type courses } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type BookingWithRelations = InferSelectModel<typeof bookings> & {
  instructor: InferSelectModel<typeof instructors>;
  course: InferSelectModel<typeof courses> | null;
};
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "success",
  pending: "warning",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
};

export default async function LessonsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, session.user.id),
  });
  if (!profile) redirect("/register");

  const allBookings = await db.query.bookings.findMany({
    where: eq(bookings.studentId, profile.id),
    with: { instructor: true, course: true },
    orderBy: (b, { desc }) => [desc(b.scheduledAt)],
  });

  const upcoming = allBookings.filter((b) => ["confirmed", "pending"].includes(b.status));
  const past = allBookings.filter((b) => ["completed", "cancelled", "no_show"].includes(b.status));

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
  return (
    <Card className="hover:border-amber/40 transition-colors">
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
            {booking.instructor.firstName} {booking.instructor.lastName}
          </div>
          <div className="text-muted-foreground text-xs mt-0.5">
            {formatDateTime(booking.scheduledAt)} · {booking.durationMinutes} min
          </div>
          {booking.course && (
            <div className="text-muted-foreground text-xs truncate">{booking.course.name}</div>
          )}
          <div className="text-muted-foreground text-xs truncate">{booking.locationPickup}</div>
        </div>
        <Badge
          variant={statusColor as "success" | "warning" | "secondary" | "destructive"}
          className="capitalize flex-shrink-0"
        >
          {booking.status.replace("_", " ")}
        </Badge>
      </CardContent>
    </Card>
  );
}
