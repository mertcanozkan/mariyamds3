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

const createSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Min 8 characters"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  dvsaAdiNumber: z.string().min(1, "Required"),
  bio: z.string().optional(),
  specialisations: z.string().optional(), // comma-separated input
  availableFrom: z.string().default("08:00"),
  availableTo: z.string().default("18:00"),
});

const editSchema = createSchema.omit({ email: true, password: true });

type CreateInput = z.infer<typeof createSchema>;
type EditInput = z.infer<typeof editSchema>;

type InstructorData = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  dvsaAdiNumber: string;
  bio: string | null;
  specialisations: string[];
  availableFrom: string;
  availableTo: string;
  isActive: boolean;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor?: InstructorData;
  onSuccess: () => void;
}

export function InstructorDialog({ open, onOpenChange, instructor, onSuccess }: Props) {
  const isEdit = !!instructor;
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateInput>({
    resolver: zodResolver(isEdit ? editSchema : createSchema) as never,
    defaultValues: {
      email: "",
      password: "",
      firstName: instructor?.firstName ?? "",
      lastName: instructor?.lastName ?? "",
      phone: instructor?.phone ?? "",
      dvsaAdiNumber: instructor?.dvsaAdiNumber ?? "",
      bio: instructor?.bio ?? "",
      specialisations: instructor?.specialisations.join(", ") ?? "",
      availableFrom: instructor?.availableFrom ?? "08:00",
      availableTo: instructor?.availableTo ?? "18:00",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        email: "",
        password: "",
        firstName: instructor?.firstName ?? "",
        lastName: instructor?.lastName ?? "",
        phone: instructor?.phone ?? "",
        dvsaAdiNumber: instructor?.dvsaAdiNumber ?? "",
        bio: instructor?.bio ?? "",
        specialisations: instructor?.specialisations.join(", ") ?? "",
        availableFrom: instructor?.availableFrom ?? "08:00",
        availableTo: instructor?.availableTo ?? "18:00",
      });
    }
  }, [open, instructor, form]);

  async function onSubmit(values: CreateInput | EditInput) {
    setLoading(true);
    try {
      const payload = {
        ...values,
        specialisations: (values.specialisations ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const url = isEdit
        ? `/api/admin/instructors/${instructor!.id}`
        : "/api/admin/instructors";

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");

      toast({ title: isEdit ? "Instructor updated" : "Instructor created" });
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
          <DialogTitle>{isEdit ? "Edit Instructor" : "Add Instructor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Email</Label>
                <Input {...form.register("email")} type="email" placeholder="instructor@example.com" />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Password</Label>
                <Input {...form.register("password")} type="password" placeholder="Min 8 characters" />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input {...form.register("firstName")} placeholder="Jane" />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input {...form.register("lastName")} placeholder="Smith" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input {...form.register("phone")} placeholder="07700 000000" />
            </div>
            <div className="space-y-1.5">
              <Label>DVSA ADI Number</Label>
              <Input {...form.register("dvsaAdiNumber")} placeholder="ADI-1234567" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea {...form.register("bio")} placeholder="Short bio…" rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label>Specialisations <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
            <Input {...form.register("specialisations")} placeholder="nervous learners, motorway, intensive" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Available From</Label>
              <Input {...form.register("availableFrom")} type="time" />
            </div>
            <div className="space-y-1.5">
              <Label>Available To</Label>
              <Input {...form.register("availableTo")} type="time" />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="amber" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Instructor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
