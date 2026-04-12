"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  type: z.enum(["hourly", "package", "intensive"]),
  pricePence: z.coerce.number().positive("Must be positive"),
  pricePerHourPence: z.coerce.number().positive().nullable().optional(),
  hoursIncluded: z.coerce.number().int().positive().nullable().optional(),
  features: z.string().optional(), // newline-separated
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: z.coerce.number().int().min(0),
});

type FormInput = z.infer<typeof schema>;

type CourseData = {
  id: string;
  name: string;
  description: string;
  type: "hourly" | "package" | "intensive";
  pricePence: number;
  pricePerHourPence: number | null;
  hoursIncluded: number | null;
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: CourseData;
  onSuccess: () => void;
}

export function CourseDialog({ open, onOpenChange, course, onSuccess }: Props) {
  const isEdit = !!course;
  const [loading, setLoading] = useState(false);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: course?.name ?? "",
      description: course?.description ?? "",
      type: course?.type ?? "hourly",
      pricePence: course?.pricePence ? course.pricePence / 100 : 35,
      pricePerHourPence: course?.pricePerHourPence ? course.pricePerHourPence / 100 : null,
      hoursIncluded: course?.hoursIncluded ?? null,
      features: course?.features.join("\n") ?? "",
      isActive: course?.isActive ?? true,
      isFeatured: course?.isFeatured ?? false,
      displayOrder: course?.displayOrder ?? 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: course?.name ?? "",
        description: course?.description ?? "",
        type: course?.type ?? "hourly",
        pricePence: course?.pricePence ? course.pricePence / 100 : 35,
        pricePerHourPence: course?.pricePerHourPence ? course.pricePerHourPence / 100 : null,
        hoursIncluded: course?.hoursIncluded ?? null,
        features: course?.features.join("\n") ?? "",
        isActive: course?.isActive ?? true,
        isFeatured: course?.isFeatured ?? false,
        displayOrder: course?.displayOrder ?? 0,
      });
    }
  }, [open, course, form]);

  async function onSubmit(values: FormInput) {
    setLoading(true);
    try {
      const payload = {
        ...values,
        pricePence: Math.round(values.pricePence * 100),
        pricePerHourPence: values.pricePerHourPence ? Math.round(values.pricePerHourPence * 100) : null,
        hoursIncluded: values.hoursIncluded || null,
        features: (values.features ?? "")
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      };

      const url = isEdit ? `/api/admin/courses/${course!.id}` : "/api/admin/courses";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");

      toast({ title: isEdit ? "Course updated" : "Course created" });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const courseType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Course" : "Add Course"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Course Name</Label>
            <Input {...form.register("name")} placeholder="e.g. 20-Hour Standard Package" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea {...form.register("description")} rows={2} placeholder="Short description…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(v) => form.setValue("type", v as "hourly" | "package" | "intensive")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                  <SelectItem value="intensive">Intensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Display Order</Label>
              <Input {...form.register("displayOrder")} type="number" min={0} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Total Price (£)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
                <Input
                  {...form.register("pricePence")}
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  placeholder="35.00"
                />
              </div>
              {form.formState.errors.pricePence && (
                <p className="text-xs text-destructive">{form.formState.errors.pricePence.message}</p>
              )}
            </div>

            {courseType === "hourly" && (
              <div className="space-y-1.5">
                <Label>Price Per Hour (£)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
                  <Input
                    {...form.register("pricePerHourPence")}
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7"
                    placeholder="35.00"
                  />
                </div>
              </div>
            )}

            {courseType !== "hourly" && (
              <div className="space-y-1.5">
                <Label>Hours Included</Label>
                <Input {...form.register("hoursIncluded")} type="number" min={1} placeholder="20" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Features <span className="text-muted-foreground text-xs">(one per line)</span></Label>
            <Textarea {...form.register("features")} rows={4} placeholder={"Mock test included\nProgress review\nFlexible scheduling"} />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <input id="isActive" type="checkbox" className="h-4 w-4 rounded accent-amber" {...form.register("isActive")} />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <input id="isFeatured" type="checkbox" className="h-4 w-4 rounded accent-amber" {...form.register("isFeatured")} />
              <Label htmlFor="isFeatured">Featured (Most Popular)</Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="amber" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
