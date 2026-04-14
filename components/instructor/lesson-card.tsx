"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardEdit } from "lucide-react";
import { LessonStatusDialog } from "./lesson-status-dialog";
import { formatDateTime } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "success",
  pending: "warning",
  change_requested: "warning",
  cancellation_requested: "warning",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
  rescheduled: "secondary",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  change_requested: "Change Pending",
  cancellation_requested: "Cancellation Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
  rescheduled: "Rescheduled",
};

interface Props {
  booking: {
    id: string;
    scheduledAt: Date;
    durationMinutes: number;
    locationPickup: string;
    status: string;
    rescheduledTo: Date | null;
    student: { firstName: string; lastName: string };
    course: { name: string } | null;
  };
}

export function LessonCard({ booking }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="hover:border-amber/40 transition-colors">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-navy/5 flex flex-col items-center justify-center flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              {new Date(booking.scheduledAt).toLocaleDateString("en-GB", { weekday: "short" })}
            </div>
            <div className="font-bold text-navy text-lg leading-none">
              {new Date(booking.scheduledAt).getDate()}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-navy text-sm">
              {booking.student.firstName} {booking.student.lastName}
            </div>
            <div className="text-muted-foreground text-xs mt-0.5">
              {formatDateTime(booking.scheduledAt)} · {booking.durationMinutes} min
            </div>
            {booking.locationPickup && (
              <div className="text-muted-foreground text-xs truncate">{booking.locationPickup}</div>
            )}
            {booking.course && (
              <div className="text-muted-foreground text-xs">{booking.course.name}</div>
            )}
            {booking.status === "rescheduled" && booking.rescheduledTo && (
              <div className="text-blue-600 text-xs mt-0.5 font-medium">
                Rescheduled to: {formatDateTime(booking.rescheduledTo)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant={STATUS_COLORS[booking.status] as "success" | "warning" | "secondary" | "destructive"}
            >
              {STATUS_LABELS[booking.status] ?? booking.status}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              title="Update lesson status"
              onClick={() => setDialogOpen(true)}
            >
              <ClipboardEdit className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <LessonStatusDialog
        bookingId={booking.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
