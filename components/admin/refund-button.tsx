"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface Props {
  paymentId: string;
  amount: number;
}

export function RefundButton({ paymentId, amount }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRefund() {
    if (!confirm(`Issue a full refund of ${formatCurrency(amount)}?`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Refund failed");
      toast({ title: "Refund issued", description: `${formatCurrency(amount)} refunded.` });
      router.refresh();
    } catch (err) {
      toast({
        title: "Refund failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-xs h-7 px-2 text-destructive hover:text-destructive"
      disabled={loading}
      onClick={handleRefund}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refund"}
    </Button>
  );
}
