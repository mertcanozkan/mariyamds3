import { db } from "@/lib/db";
import { payments, studentProfiles } from "@/lib/db/schema";
import { eq, sum, count } from "drizzle-orm";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RefundButton } from "@/components/admin/refund-button";

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const PAGE_SIZE = 25;

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const { status, page } = await searchParams;
  const currentPage = parseInt(page ?? "1", 10);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const whereClause = status
    ? eq(payments.status, status as typeof payments.status._.data)
    : undefined;

  const [allPayments, totalPaidResult, totalResult] = await Promise.all([
    db.query.payments.findMany({
      where: whereClause,
      with: { student: true },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit: PAGE_SIZE,
      offset,
    }),
    db.select({ total: sum(payments.amountPence) }).from(payments).where(eq(payments.status, "paid")),
    db.select({ count: count() }).from(payments).where(whereClause),
  ]);

  const totalRevenue = Number(totalPaidResult[0]?.total ?? 0);
  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const STATUSES = ["pending", "paid", "refunded", "failed"];

  return (
    <div className="lg:pt-0 pt-14 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-2xl font-bold text-navy">Payments</h1>
        <div className="text-right">
          <div className="font-bold text-navy">{formatCurrency(totalRevenue)}</div>
          <div className="text-xs text-muted-foreground">Total Revenue</div>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/payments">
          <Badge variant={!status ? "navy" : "secondary"} className="cursor-pointer">All</Badge>
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/payments?status=${s}`}>
            <Badge variant={status === s ? "navy" : "secondary"} className="cursor-pointer capitalize">
              {s}
            </Badge>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {allPayments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No payments found</div>
          ) : (
            allPayments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-navy">
                    {payment.student.firstName} {payment.student.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {payment.description}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {payment.paidAt ? formatDateTime(payment.paidAt) : "Pending"}
                  </div>
                  {payment.stripePaymentIntentId && (
                    <div className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                      {payment.stripePaymentIntentId}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-semibold text-navy">{formatCurrency(payment.amountPence)}</div>
                    <Badge
                      variant={
                        payment.status === "paid"
                          ? "success"
                          : payment.status === "refunded"
                          ? "secondary"
                          : payment.status === "failed"
                          ? "destructive"
                          : "warning"
                      }
                      className="capitalize text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                  {payment.status === "paid" && payment.stripePaymentIntentId && (
                    <RefundButton
                      paymentId={payment.id}
                      amount={payment.amountPence}
                    />
                  )}
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
