"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Pencil, X, AlertTriangle, Clock } from "lucide-react";

interface Props {
  bookingId: string;
  status: "pending" | "confirmed" | "change_requested" | "cancellation_requested";
  scheduledAt: string; // ISO string
  durationMinutes: number;
  proposedScheduledAt?: string | null;
  proposedDurationMinutes?: number | null;
  changeRequestNote?: string | null;
  cancellationReason?: string | null;
}

function toLocalDateString(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toLocalTimeString(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function LessonEditDialog({
  bookingId,
  status,
  scheduledAt,
  durationMinutes,
  proposedScheduledAt,
  proposedDurationMinutes,
  changeRequestNote,
  cancellationReason,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelNote, setCancelNote] = useState("");

  const baseDate = proposedScheduledAt ?? scheduledAt;
  const baseDuration = proposedDurationMinutes ?? durationMinutes;

  const [date, setDate] = useState(toLocalDateString(baseDate));
  const [time, setTime] = useState(toLocalTimeString(baseDate));
  const [duration, setDuration] = useState(String(baseDuration));
  const [note, setNote] = useState(changeRequestNote ?? "");

  const hoursUntil = (new Date(scheduledAt).getTime() - Date.now()) / 3_600_000;
  const isLateCancellation = hoursUntil < 48;
  const canCancel = ["pending", "confirmed"].includes(status);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setConfirmCancel(false);
      setCancelNote("");
    }
  }

  // Withdraw a pending change request
  async function handleWithdrawChange() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelChangeRequest: true }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Change request withdrawn" });
      router.refresh();
    } catch {
      toast({ title: "Failed to withdraw request", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // Withdraw a pending cancellation request
  async function handleWithdrawCancellation() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelCancellationRequest: true }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Cancellation request withdrawn", description: "Your lesson is back to confirmed." });
      router.refresh();
    } catch {
      toast({ title: "Failed to withdraw request", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelLesson() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelNote.trim() || null }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      const json = await res.json();
      if (json.requested) {
        toast({
          title: "Cancellation request sent",
          description: "Your instructor will review and approve, charge, or reject it.",
        });
      } else {
        toast({ title: "Lesson cancelled" });
      }
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast({
        title: "Cancellation failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setConfirmCancel(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const scheduledAtISO = new Date(`${date}T${time}:00`).toISOString();
      const body = {
        proposedScheduledAt: scheduledAtISO,
        proposedDurationMinutes: parseInt(duration),
        changeRequestNote: note.trim() || null,
      };
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      toast({
        title: "Change request submitted",
        description: "Your instructor will review and confirm the change.",
      });
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast({
        title: "Failed to submit request",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Cancellation already requested — show withdraw option
  if (status === "cancellation_requested") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 text-xs text-muted-foreground"
        disabled={loading}
        onClick={handleWithdrawCancellation}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><X className="h-3 w-3 mr-1" />Withdraw cancellation</>}
      </Button>
    );
  }

  // Change already requested — show withdraw option
  if (status === "change_requested") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 text-xs text-muted-foreground"
        disabled={loading}
        onClick={handleWithdrawChange}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><X className="h-3 w-3 mr-1" />Cancel request</>}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Change</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Your instructor will review and confirm or reject this change.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lesson-date">Date</Label>
              <input
                id="lesson-date"
                type="date"
                required
                value={date}
                min={toLocalDateString(new Date().toISOString())}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-time">Time</Label>
              <input
                id="lesson-time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="60">1 hour (60 min)</SelectItem>
                <SelectItem value="90">1.5 hours (90 min)</SelectItem>
                <SelectItem value="120">2 hours (120 min)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="change-note">Note to instructor (optional)</Label>
            <textarea
              id="change-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for the change..."
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Discard
            </Button>
            <Button type="submit" variant="amber" disabled={loading}>
              {loading && !confirmCancel && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>

        {/* Cancel section */}
        {canCancel && (
          <div className="border-t pt-4 mt-2">
            {!confirmCancel ? (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="text-xs text-destructive hover:underline w-full text-left"
              >
                Cancel this lesson
              </button>
            ) : isLateCancellation ? (
              /* Late cancellation — goes to instructor for review */
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">Less than 48 hours away</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Your cancellation request will be sent to your instructor. They can approve it, reject it, or approve it with a late cancellation fee.
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cancel-note" className="text-xs">Reason (optional)</Label>
                  <textarea
                    id="cancel-note"
                    rows={2}
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    placeholder="Let your instructor know why you need to cancel..."
                    className="w-full px-3 py-2 rounded-md border border-amber-200 bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" className="flex-1" disabled={loading} onClick={() => setConfirmCancel(false)}>
                    Keep lesson
                  </Button>
                  <Button type="button" size="sm" variant="amber" className="flex-1" disabled={loading} onClick={handleCancelLesson}>
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Send request"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Standard cancellation — direct */
              <div className="rounded-md bg-destructive/5 border border-destructive/20 p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive font-medium">Cancel this lesson?</p>
                </div>
                <p className="text-xs text-muted-foreground">This cannot be undone. Your lesson will be cancelled immediately.</p>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" className="flex-1" disabled={loading} onClick={() => setConfirmCancel(false)}>
                    Keep lesson
                  </Button>
                  <Button type="button" size="sm" variant="destructive" className="flex-1" disabled={loading} onClick={handleCancelLesson}>
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes, cancel it"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
