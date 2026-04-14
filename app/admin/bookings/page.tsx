import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookingStatusActions } from "@/components/admin/booking-status-actions";
import { Clock } from "lucide-react";

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

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const PAGE_SIZE = 25;

export default async function AdminBookingsPage({ searchParams }: Props) {
  const { status, page } = await searchParams;
  const currentPage = parseInt(page ?? "1", 10);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const whereClause = status
    ? eq(bookings.status, status as typeof bookings.status._.data)
    : undefined;

  const [allBookings, totalResult] = await Promise.all([
    db.query.bookings.findMany({
      where: whereClause,
      with: { student: true, instructor: true, course: true },
      orderBy: (b, { desc }) => [desc(b.scheduledAt)],
      limit: PAGE_SIZE,
      offset,
    }),
    db.select({ count: count() }).from(bookings).where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const STATUSES = ["pending", "confirmed", "change_requested", "cancellation_requested", "completed", "cancelled", "no_show"];

  return (
    <div className="lg:pt-0 pt-14 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-navy">Bookings</h1>
        <span className="text-sm text-muted-foreground">{total} results</span>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/bookings">
          <Badge variant={!status ? "navy" : "secondary"} className="cursor-pointer">All</Badge>
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/bookings?status=${s}`}>
            <Badge
              variant={status === s ? "navy" : "secondary"}
              className="cursor-pointer capitalize"
            >
              {STATUS_LABELS[s] ?? s.replace("_", " ")}
            </Badge>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {allBookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No bookings found</div>
          ) : (
            allBookings.map((booking) => (
              <div key={booking.id} className="flex items-start gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-navy">
                    {booking.student.firstName} {booking.student.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDateTime(booking.scheduledAt)} · {booking.durationMinutes}min ·{" "}
                    {booking.instructor ? `${booking.instructor.firstName} ${booking.instructor.lastName}` : "Unassigned"}
                  </div>
                  {booking.course && (
                    <div className="text-xs text-muted-foreground">{booking.course.name}</div>
                  )}

                  {/* Show cancellation request details */}
                  {booking.status === "cancellation_requested" && (
                    <div className="mt-1.5 inline-flex items-start gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-xs text-amber-800">
                      <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
                      <div>
                        <span className="font-medium">Cancellation requested</span>
                        {booking.cancellationReason && (
                          <span className="italic text-amber-700 ml-1">&ldquo;{booking.cancellationReason}&rdquo;</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show proposed change for change_requested bookings */}
                  {booking.status === "change_requested" && booking.proposedScheduledAt && (
                    <div className="mt-1.5 inline-flex items-start gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-xs text-amber-800">
                      <Clock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
                      <div>
                        <span className="font-medium">Requested: </span>
                        {formatDateTime(booking.proposedScheduledAt)}
                        {booking.proposedDurationMinutes &&
                        booking.proposedDurationMinutes !== booking.durationMinutes
                          ? ` · ${booking.proposedDurationMinutes} min`
                          : ""}
                        {booking.changeRequestNote && (
                          <span className="italic text-amber-700 ml-1">
                            &ldquo;{booking.changeRequestNote}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant={STATUS_COLORS[booking.status] as "success" | "warning" | "secondary" | "destructive"}
                    className="capitalize"
                  >
                    {STATUS_LABELS[booking.status] ?? booking.status.replace("_", " ")}
                  </Badge>
                  <BookingStatusActions bookingId={booking.id} currentStatus={booking.status} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {currentPage > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`?status=${status ?? ""}&page=${currentPage - 1}`}>Previous</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`?status=${status ?? ""}&page=${currentPage + 1}`}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
