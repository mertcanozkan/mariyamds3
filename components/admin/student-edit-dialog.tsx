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
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  addressLine1: z.string().min(1, "Required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "Required"),
  postcode: z.string().min(1, "Required"),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

type FormInput = z.infer<typeof schema>;

type StudentData = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  isActive: boolean;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentData;
  onSuccess: () => void;
}

export function StudentEditDialog({ open, onOpenChange, student, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      addressLine1: student.addressLine1,
      addressLine2: student.addressLine2 ?? "",
      city: student.city,
      postcode: student.postcode,
      emergencyContactName: student.emergencyContactName ?? "",
      emergencyContactPhone: student.emergencyContactPhone ?? "",
      notes: student.notes ?? "",
      isActive: student.isActive,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName,
        phone: student.phone,
        addressLine1: student.addressLine1,
        addressLine2: student.addressLine2 ?? "",
        city: student.city,
        postcode: student.postcode,
        emergencyContactName: student.emergencyContactName ?? "",
        emergencyContactPhone: student.emergencyContactPhone ?? "",
        notes: student.notes ?? "",
        isActive: student.isActive,
      });
    }
  }, [open, student, form]);

  async function onSubmit(values: FormInput) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");

      toast({ title: "Student updated" });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input {...form.register("lastName")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input {...form.register("phone")} />
          </div>

          <div className="space-y-1.5">
            <Label>Address Line 1</Label>
            <Input {...form.register("addressLine1")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-1.5">
              <Label>Address Line 2</Label>
              <Input {...form.register("addressLine2")} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input {...form.register("city")} />
            </div>
            <div className="space-y-1.5">
              <Label>Postcode</Label>
              <Input {...form.register("postcode")} className="uppercase" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Emergency Contact</Label>
              <Input {...form.register("emergencyContactName")} placeholder="Name" />
            </div>
            <div className="space-y-1.5">
              <Label>Emergency Phone</Label>
              <Input {...form.register("emergencyContactPhone")} placeholder="07700…" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Internal Notes</Label>
            <Textarea {...form.register("notes")} placeholder="Admin-only notes…" rows={2} />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-amber"
              {...form.register("isActive")}
            />
            <Label htmlFor="isActive">Account active</Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="amber" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
