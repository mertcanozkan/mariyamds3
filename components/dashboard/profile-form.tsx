"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Eye, EyeOff, Camera } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phone: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

interface Props {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    provisionalLicenceNumber: string | null;
    profilePhotoUrl?: string | null;
  };
  email: string;
}

export function ProfileForm({ profile, email }: Props) {
  const { data: session, update: updateSession } = useSession();
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl]     = useState<string | null>(profile.profilePhotoUrl ?? null);
  const [uploading, setUploading]     = useState(false);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  // Use the proxy route for blob URLs so the private token stays server-side.
  // For OAuth images the proxy redirects to the public URL directly.
  const rawImage = avatarUrl ?? session?.user?.image ?? null;
  const displayImage = rawImage ? "/api/profile/avatar-url" : null;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum size is 5 MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: form });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        throw new Error(error ?? "Upload failed");
      }

      const { url } = await res.json();
      setAvatarUrl(url);
      // Push raw URL into JWT (used as a presence flag); display always goes via proxy
      await updateSession({ image: url });
      toast({ title: "Photo updated", description: "Your profile photo has been saved." });
    } catch (err: unknown) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone ?? "",
      emergencyContactName: profile.emergencyContactName ?? "",
      emergencyContactPhone: profile.emergencyContactPhone ?? "",
    },
  });

  async function onSubmit(data: ProfileInput) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      toast({ title: "Failed to save", description: "Please try again.", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-navy">Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ── Avatar uploader ── */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative group flex-shrink-0 focus:outline-none"
              aria-label="Change profile photo"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-amber transition-all duration-200">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-amber/10 flex items-center justify-center">
                    <span className="text-amber font-playfair font-bold text-2xl">{initials}</span>
                  </div>
                )}
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                {uploading
                  ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                  : <Camera className="h-5 w-5 text-white" />
                }
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleAvatarChange}
            />
            <div>
              <p className="text-sm font-medium text-foreground">Profile photo</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click to upload · JPEG, PNG, WebP or GIF · Max 5 MB
              </p>
              {uploading && (
                <p className="text-xs text-amber mt-1 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input {...register("firstName")} />
                {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input {...register("lastName")} />
                {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
            </div>

            <div className="space-y-2">
              <Label>Phone (optional)</Label>
              <Input placeholder="07700 000000" {...register("phone")} />
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-navy mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Full name" {...register("emergencyContactName")} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="07700 000000" {...register("emergencyContactPhone")} />
                </div>
              </div>
            </div>

            <Button type="submit" variant="amber" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
              ) : saved ? (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Saved!</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <ChangePasswordCard />

      {/* Read-only test info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-navy">Provisional Licence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Licence Number</span>
            <span className="text-navy font-medium">{profile.provisionalLicenceNumber ?? "Not provided"}</span>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Contact your instructor to update licence details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Change Password Card ─────────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain one uppercase letter")
      .regex(/[0-9]/, "Must contain one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

function ChangePasswordCard() {
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [saved, setSaved]               = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(data: ChangePasswordInput) {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });

    if (res.ok) {
      setSaved(true);
      reset();
      setTimeout(() => setSaved(false), 4000);
    } else {
      const body = await res.json().catch(() => ({}));
      const msg =
        body.code === "WRONG_PASSWORD"
          ? "Current password is incorrect."
          : body.code === "NO_PASSWORD"
          ? "This account uses Google sign-in — no password is set."
          : "Failed to update password. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-navy">Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current password */}
          <div className="space-y-2">
            <Label>Current password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10"
                {...register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showCurrent ? "Hide" : "Show"}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-destructive text-xs">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New password */}
          <div className="space-y-2">
            <Label>New password</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10"
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showNew ? "Hide" : "Show"}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-destructive text-xs">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm new password */}
          <div className="space-y-2">
            <Label>Confirm new password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? "Hide" : "Show"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button type="submit" variant="amber" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating…</>
              ) : saved ? (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Password updated!</>
              ) : (
                "Update password"
              )}
            </Button>
            <a
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-4"
            >
              Forgot your password?
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
