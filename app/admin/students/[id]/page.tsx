import { db } from "@/lib/db";
import { studentProfiles, bookings, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StudentDetailActions } from "@/components/admin/student-detail-actions";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "success",
  pending: "warning",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminStudentDetailPage({ params }: Props) {
  const { id } = await params;

  const [student, studentBookings, studentPayments] = await Promise.all([
    db.query.studentProfiles.findFirst({ where: eq(studentProfiles.id, id) }),
    db.query.bookings.findMany({
      where: eq(bookings.studentId, id),
      with: { instructor: true, course: true },
      orderBy: (b, { desc }) => [desc(b.scheduledAt)],
      limit: 20,
    }),
    db.query.payments.findMany({
      where: eq(payments.studentId, id),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    }),
  ]);

  if (!student) notFound();

  const totalPaid = studentPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountPence, 0);

  return (
    <div className="lg:pt-0 pt-14 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/students"><ArrowLeft className="h-4 w-4 mr-1" /> Students</Link>
        </Button>
        <div className="flex gap-2">
          <StudentDetailActions student={student} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center font-bold text-navy text-lg flex-shrink-0">
          {student.firstName[0]}{student.lastName[0]}
        </div>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-navy">
            {student.firstName} {student.lastName}
          </h1>
          <div className="text-muted-foreground text-sm">
            Joined {formatDate(student.createdAt)}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-navy">{studentBookings.length}</div>
          <div className="text-xs text-muted-foreground">Total Bookings</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-navy">
            {studentBookings.filter(b => b.status === "completed").length}
          </div>
          <div className="text-xs text-muted-foreground">Lessons Completed</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-amber">{formatCurrency(totalPaid)}</div>
          <div className="text-xs text-muted-foreground">Total Paid</div>
        </CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-navy">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="text-navy">{student.phone ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Licence</span>
              <span className="font-mono text-navy text-xs">{student.provisionalLicenceNumber ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Emergency Contact</span>
              <span className="text-navy">{student.emergencyContactName ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Emergency Phone</span>
              <span className="text-navy">{student.emergencyContactPhone ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Bookings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-navy">Booking History</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {studentBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center p-6">No bookings</p>
          ) : (
            studentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-medium text-navy">
                    {formatDateTime(booking.scheduledAt)} · {booking.durationMinutes}min
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.instructor ? `${booking.instructor.firstName} ${booking.instructor.lastName}` : "Unassigned"}
                    {booking.course && ` · ${booking.course.name}`}
                  </div>
                </div>
                <Badge
                  variant={STATUS_COLORS[booking.status] as "success" | "warning" | "secondary" | "destructive"}
                  className="capitalize"
                >
                  {booking.status.replace("_", " ")}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
