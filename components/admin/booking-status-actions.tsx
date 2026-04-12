"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

interface Props {
  bookingId: string;
  currentStatus: string;
}

export function BookingStatusActions({ bookingId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const nextStatuses = TRANSITIONS[currentStatus] ?? [];
  if (nextStatuses.length === 0) return null;

  async function transition(newStatus: string) {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      toast({ title: "Update failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-1">
      {nextStatuses.map((s) => (
        <Button
          key={s}
          size="sm"
          variant="outline"
          className="text-xs capitalize h-7 px-2"
          disabled={loading !== null}
          onClick={() => transition(s)}
        >
          {loading === s ? <Loader2 className="h-3 w-3 animate-spin" /> : s.replace("_", " ")}
        </Button>
      ))}
    </div>
  );
}
