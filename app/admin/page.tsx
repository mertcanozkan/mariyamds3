import { db } from "@/lib/db";
import { users, bookings, payments, studentProfiles } from "@/lib/db/schema";
import { eq, count, sum, gte, desc } from "drizzle-orm";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, PoundSterling, TrendingUp } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "success",
  pending: "warning",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
};

export default async function AdminOverviewPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalStudents,
    totalBookings,
    revenueResult,
    recentBookings,
    pendingBookings,
  ] = await Promise.all([
    db.select({ count: count() }).from(studentProfiles),
    db.select({ count: count() }).from(bookings),
    db
      .select({ total: sum(payments.amountPence) })
      .from(payments)
      .where(eq(payments.status, "paid")),
    db.query.bookings.findMany({
      with: { student: true, instructor: true },
      orderBy: (b, { desc }) => [desc(b.createdAt)],
      limit: 8,
    }),
    db.select({ count: count() }).from(bookings).where(eq(bookings.status, "pending")),
  ]);

  const totalRevenuePence = Number(revenueResult[0]?.total ?? 0);

  const stats = [
    { label: "Total Students", value: totalStudents[0]?.count ?? 0, icon: Users, href: "/admin/students" },
    { label: "Total Bookings", value: totalBookings[0]?.count ?? 0, icon: Calendar, href: "/admin/bookings" },
    { label: "Revenue (All Time)", value: formatCurrency(totalRevenuePence), icon: PoundSterling, href: "/admin/payments" },
    { label: "Pending Bookings", value: pendingBookings[0]?.count ?? 0, icon: TrendingUp, href: "/admin/bookings" },
  ];

  return (
    <div className="lg:pt-0 pt-14 space-y-6">
      <h1 className="font-playfair text-2xl font-bold text-navy">Admin Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:border-amber/40 transition-colors cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-navy" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-navy">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold text-navy">Recent Bookings</CardTitle>
          <Link href="/admin/bookings" className="text-sm text-amber hover:underline">View all</Link>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-navy">
                  {booking.student.firstName} {booking.student.lastName}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatDateTime(booking.scheduledAt)} · {booking.instructor.firstName} {booking.instructor.lastName}
                </div>
              </div>
              <Badge
                variant={STATUS_COLORS[booking.status] as "success" | "warning" | "secondary" | "destructive"}
                className="capitalize flex-shrink-0"
              >
                {booking.status.replace("_", " ")}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
