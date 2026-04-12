import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { studentProfiles, payments } from "@/lib/db/schema";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, session.user.id),
  });
  if (!profile) redirect("/register");

  const allPayments = await db.query.payments.findMany({
    where: eq(payments.studentId, profile.id),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });

  const totalPaid = allPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountPence, 0);

  const totalPending = allPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amountPence, 0);

  return (
    <div className="lg:pt-0 pt-14 space-y-6">
      <h1 className="font-playfair text-2xl font-bold text-navy">Payments</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-navy">{formatCurrency(totalPaid)}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Paid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber">{formatCurrency(totalPending)}</div>
            <div className="text-xs text-muted-foreground mt-1">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment list */}
      {allPayments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No payment history yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {allPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-sm text-navy">{payment.description}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {payment.paidAt ? formatDateTime(payment.paidAt) : "Awaiting payment"}
                  </div>
                  {payment.stripePaymentIntentId && (
                    <div className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                      {payment.stripePaymentIntentId}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-navy">{formatCurrency(payment.amountPence)}</div>
                  <Badge
                    variant={
                      payment.status === "paid"
                        ? "success"
                        : payment.status === "refunded"
                        ? "secondary"
                        : "warning"
                    }
                    className="capitalize text-xs mt-1"
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
