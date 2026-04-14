"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

const schema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    title: z.string().min(1, "Job title is required"),
    phone: z
      .string()
      .regex(/^(\+44|0)[0-9]{10}$/, "Enter a valid UK phone number")
      .optional()
      .or(z.literal("")),
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain one uppercase letter")
      .regex(/[0-9]/, "Must contain one number")
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (d) => !d.newPassword || d.newPassword === d.confirmPassword,
    { message: "Passwords do not match", path: ["confirmPassword"] }
  );

type FormInput = z.infer<typeof schema>;

export default function AdminSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", title: "School Administrator", phone: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(data: FormInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          title: data.title,
          phone: data.phone || null,
          newPassword: data.newPassword || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ title: "Setup failed", description: err.error, variant: "destructive" });
        return;
      }

      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy to-navy-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-amber" />
              </div>
              <div>
                <h1 className="font-playfair text-xl font-bold text-navy">Welcome to the Admin Panel</h1>
                <p className="text-muted-foreground text-xs mt-0.5">Complete your profile to get started</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* ── Identity ── */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-navy border-b border-border pb-2">Your Details</h2>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Mariyam Lunat" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title">Job title</Label>
                  <Input id="title" placeholder="School Owner" {...register("title")} />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                  <p className="text-xs text-muted-foreground">Shown within the admin panel (e.g. School Owner, Operations Manager)</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input id="phone" placeholder="07700 900000" {...register("phone")} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
              </div>

              {/* ── Password ── */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-navy border-b border-border pb-2">
                  Change Password <span className="font-normal text-muted-foreground text-xs ml-1">(recommended)</span>
                </h2>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input id="newPassword" type="password" placeholder="Min. 8 characters" {...register("newPassword")} />
                  {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Repeat password" {...register("confirmPassword")} />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <Button type="submit" variant="amber" size="lg" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Setting up…</> : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
