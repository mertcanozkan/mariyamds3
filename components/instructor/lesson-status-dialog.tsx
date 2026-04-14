"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, AlertCircle, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

type OutcomeStatus = "completed" | "cancelled" | "no_show" | "rescheduled";

interface Option {
  value: OutcomeStatus;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const OPTIONS: Option[] = [
  {
    value: "completed",
    label: "Completed",
    description: "Lesson took place as scheduled",
    icon: CheckCircle2,
    color: "border-green-200 bg-green-50 text-green-700 hover:border-green-400",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    description: "Lesson was cancelled",
    icon: XCircle,
    color: "border-red-200 bg-red-50 text-red-700 hover:border-red-400",
  },
  {
    value: "no_show",
    label: "No Show",
    description: "Student did not attend",
    icon: AlertCircle,
    color: "border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-400",
  },
  {
    value: "rescheduled",
    label: "Rescheduled",
    description: "Lesson moved to a new date/time",
    icon: CalendarClock,
    color: "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-400",
  },
];

interface Props {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LessonStatusDialog({ bookingId, open, onOpenChange }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<OutcomeStatus | null>(null);
  const [rescheduledTo, setRescheduledTo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    if (selected === "rescheduled" && !rescheduledTo) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/instructor/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_status",
          status: selected,
          ...(selected === "rescheduled" ? { rescheduledTo } : {}),
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const labels: Record<OutcomeStatus, string> = {
        completed: "Lesson marked as completed",
        cancelled: "Lesson marked as cancelled",
        no_show: "Lesson marked as no show",
        rescheduled: "Lesson marked as rescheduled",
      };

      toast({ title: labels[selected] });
      onOpenChange(false);
      setSelected(null);
      setRescheduledTo("");
      router.refresh();
    } catch {
      toast({ title: "Action failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair text-navy">Update Lesson Status</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-2">
          {OPTIONS.map(({ value, label, description, icon: Icon, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-all",
                color,
                selected === value ? "ring-2 ring-offset-1 ring-navy/30" : "opacity-80 hover:opacity-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium text-sm">{label}</span>
              <span className="text-xs opacity-75">{description}</span>
            </button>
          ))}
        </div>

        {selected === "rescheduled" && (
          <div className="space-y-1.5">
            <Label htmlFor="rescheduled-to" className="text-sm text-navy font-medium">
              Rescheduled to
            </Label>
            <Input
              id="rescheduled-to"
              type="datetime-local"
              value={rescheduledTo}
              onChange={(e) => setRescheduledTo(e.target.value)}
              className="text-sm"
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="amber"
            onClick={handleSubmit}
            disabled={!selected || (selected === "rescheduled" && !rescheduledTo) || loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
