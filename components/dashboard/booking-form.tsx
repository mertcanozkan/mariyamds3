"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Course = {
  id: string;
  name: string;
  type: string;
  pricePerHourPence: number | null;
  pricePence: number;
  hoursIncluded: number | null;
};

type Instructor = {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
};

interface Props {
  courses: Course[];
  instructors: Instructor[];
  studentId: string;
}

export function BookingForm({ courses, instructors, studentId }: Props) {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { studentId, durationMinutes: 60 },
  });

  const selectedCourseId = watch("courseId");
  const selectedInstructorId = watch("instructorId");
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  async function onSubmit(data: BookingInput) {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast({ title: "Booking failed", description: json.error ?? "Please try again.", variant: "destructive" });
      return;
    }
    if (json.checkoutUrl) {
      window.location.href = json.checkoutUrl;
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-playfair text-xl font-bold text-navy mb-2">Booking requested!</h3>
          <p className="text-muted-foreground text-sm">We&apos;ll confirm your lesson shortly.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register("studentId")} />

      {/* Course */}
      <div className="space-y-2">
        <Label>Course</Label>
        <div className="grid gap-3">
          {courses.map((course) => (
            <label
              key={course.id}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                selectedCourseId === course.id
                  ? "border-amber bg-amber/5"
                  : "border-border hover:border-amber/40"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                value={course.id}
                {...register("courseId")}
              />
              <div>
                <div className="font-medium text-navy text-sm">{course.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{course.type.replace("_", " ")}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-navy text-sm">
                  {course.pricePerHourPence
                    ? `${formatCurrency(course.pricePerHourPence)}/hr`
                    : formatCurrency(course.pricePence)}
                </div>
                {course.hoursIncluded && (
                  <div className="text-xs text-muted-foreground">{course.hoursIncluded}h total</div>
                )}
              </div>
            </label>
          ))}
        </div>
        {errors.courseId && <p className="text-destructive text-xs">{errors.courseId.message}</p>}
      </div>

      {/* Instructor */}
      <div className="space-y-2">
        <Label>Instructor</Label>
        <div className="grid gap-3">
          {instructors.map((inst) => (
            <label
              key={inst.id}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                selectedInstructorId === inst.id
                  ? "border-amber bg-amber/5"
                  : "border-border hover:border-amber/40"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                value={inst.id}
                {...register("instructorId")}
              />
              <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center font-bold text-navy flex-shrink-0">
                {inst.firstName[0]}
              </div>
              <div>
                <div className="font-medium text-navy text-sm">{inst.firstName} {inst.lastName}</div>
                {inst.bio && <div className="text-xs text-muted-foreground line-clamp-1">{inst.bio}</div>}
              </div>
            </label>
          ))}
        </div>
        {errors.instructorId && <p className="text-destructive text-xs">{errors.instructorId.message}</p>}
      </div>

      {/* Date / Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" min={new Date().toISOString().split("T")[0]} {...register("scheduledAt")} />
          {errors.scheduledAt && <p className="text-destructive text-xs">{errors.scheduledAt.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Duration</Label>
          <select
            {...register("durationMinutes", { valueAsNumber: true })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
        </div>
      </div>

      {/* Pickup location */}
      <div className="space-y-2">
        <Label>Pickup Address</Label>
        <Input placeholder="Your full address" {...register("locationPickup")} />
        {errors.locationPickup && <p className="text-destructive text-xs">{errors.locationPickup.message}</p>}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <textarea
          {...register("notes")}
          rows={3}
          placeholder="Any specific requirements or information for your instructor..."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>

      <Button type="submit" variant="amber" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
        ) : (
          "Book & Pay"
        )}
      </Button>
    </form>
  );
}
