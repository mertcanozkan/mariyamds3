"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled", "no_show"],
  change_requested: [],         // handled via confirm/reject buttons
  cancellation_requested: [],   // handled via approve/charge/reject buttons
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

  async function handleCancellationRequest(action: "approve" | "charge" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancellation-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed");
      const labels = { approve: "Cancellation approved", charge: "Cancellation approved with fee", reject: "Cancellation rejected" };
      toast({ title: labels[action] });
      router.refresh();
    } catch {
      toast({ title: "Action failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  async function handleChangeRequest(action: "confirm" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/change-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({
        title: action === "confirm" ? "Change confirmed" : "Change rejected",
        description:
          action === "confirm"
            ? "The lesson has been rescheduled."
            : "The original lesson time is kept.",
      });
      router.refresh();
    } catch {
      toast({ title: "Action failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  if (currentStatus === "change_requested") {
    return (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-green-700 border-green-200 hover:bg-green-50" disabled={loading !== null} onClick={() => handleChangeRequest("confirm")}>
          {loading === "confirm" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-700 border-red-200 hover:bg-red-50" disabled={loading !== null} onClick={() => handleChangeRequest("reject")}>
          {loading === "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reject"}
        </Button>
      </div>
    );
  }

  if (currentStatus === "cancellation_requested") {
    return (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-green-700 border-green-200 hover:bg-green-50" disabled={loading !== null} onClick={() => handleCancellationRequest("approve")}>
          {loading === "approve" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-amber-700 border-amber-200 hover:bg-amber-50" disabled={loading !== null} onClick={() => handleCancellationRequest("charge")}>
          {loading === "charge" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Charge"}
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-700 border-red-200 hover:bg-red-50" disabled={loading !== null} onClick={() => handleCancellationRequest("reject")}>
          {loading === "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reject"}
        </Button>
      </div>
    );
  }

  const nextStatuses = TRANSITIONS[currentStatus] ?? [];
  if (nextStatuses.length === 0) return null;

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
