"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  bookingId: string;
}

export function BookingActions({ bookingId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  async function act(action: "accept" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(`/api/instructor/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Request failed");

      toast({
        title: action === "accept" ? "Booking accepted" : "Booking declined",
        description:
          action === "accept"
            ? "The student has been assigned to you and the lesson is confirmed."
            : "The request will be offered to other available instructors.",
      });
      router.refresh();
    } catch {
      toast({ title: "Action failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs text-green-700 border-green-200 hover:bg-green-50"
        disabled={loading !== null}
        onClick={() => act("accept")}
      >
        {loading === "accept"
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <><CheckCircle2 className="h-3 w-3 mr-1" />Accept</>}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs text-red-700 border-red-200 hover:bg-red-50"
        disabled={loading !== null}
        onClick={() => act("reject")}
      >
        {loading === "reject"
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <><XCircle className="h-3 w-3 mr-1" />Decline</>}
      </Button>
    </div>
  );
}
