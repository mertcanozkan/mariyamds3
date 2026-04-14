"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, CheckCircle2, Camera, Eye, EyeOff,
  Upload, FileText, X, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const SPECIALISATIONS = [
  "Nervous drivers", "Motorway driving", "Pass Plus",
  "Refresher lessons", "Intensive courses", "Mock tests",
  "Theory support", "Automatic cars",
];

const DAYS = [
  { label: "Mon", value: 1 }, { label: "Tue", value: 2 },
  { label: "Wed", value: 3 }, { label: "Thu", value: 4 },
  { label: "Fri", value: 5 }, { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

const CURRENT_YEAR = new Date().getFullYear();

// ─── Schema ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName:             z.string().min(1, "Required"),
  lastName:              z.string().min(1, "Required"),
  phone:                 z.string().min(1, "Required"),
  bio:                   z.string().optional(),
  specialisations:       z.array(z.string()),
  availableFrom:         z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  availableTo:           z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  workingDays:           z.array(z.number()),
  vehicleMake:           z.string().optional(),
  vehicleModel:          z.string().optional(),
  vehicleYear:           z.union([z.string(), z.number(), z.null()]).optional(),
  vehicleColour:         z.string().optional(),
  vehicleRegistration:   z.string().optional(),
  vehicleTransmission:   z.enum(["manual", "automatic", ""]).optional(),
  insuranceProvider:     z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceExpiryDate:   z.string().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface InstructorData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string | null;
  dvsaAdiNumber: string;
  photoUrl: string | null;
  specialisations: string[];
  availableFrom: string;
  availableTo: string;
  workingDays: number[];
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  vehicleColour: string | null;
  vehicleRegistration: string | null;
  vehicleTransmission: string | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  insuranceExpiryDate: string | null;
  insuranceDocumentUrl: string | null;
}

interface Props {
  instructor: InstructorData;
  email: string;
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function InstructorProfileForm({ instructor, email }: Props) {
  const { data: session, update: updateSession } = useSession();
  const [saved, setSaved]           = useState(false);
  const [avatarUrl, setAvatarUrl]   = useState<string | null>(instructor.photoUrl ?? null);
  const [uploading, setUploading]   = useState(false);
  const [avatarBust, setAvatarBust] = useState(0);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const initials = `${instructor.firstName[0]}${instructor.lastName[0]}`.toUpperCase();

  const isBlob      = (url: string | null) => !!url?.includes("blob.vercel-storage.com");
  const blobUrl     = isBlob(avatarUrl) ? avatarUrl : isBlob(session?.user?.image ?? null) ? session?.user?.image : null;
  const oauthUrl    = !isBlob(avatarUrl) && !isBlob(session?.user?.image ?? null) ? (avatarUrl ?? session?.user?.image ?? null) : null;
  const displayImage = blobUrl
    ? `/api/profile/avatar-url${avatarBust ? `?t=${avatarBust}` : ""}`
    : oauthUrl ?? null;

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
      const res = await fetch("/api/instructor/avatar", { method: "POST", body: form });
      if (!res.ok) { const { error } = await res.json().catch(() => ({})); throw new Error(error ?? "Upload failed"); }
      const { url } = await res.json();
      setAvatarUrl(url);
      setAvatarBust(Date.now());
      await updateSession({ image: url });
      toast({ title: "Photo updated" });
    } catch (err: unknown) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName:             instructor.firstName,
      lastName:              instructor.lastName,
      phone:                 instructor.phone,
      bio:                   instructor.bio ?? "",
      specialisations:       instructor.specialisations,
      availableFrom:         instructor.availableFrom.slice(0, 5),
      availableTo:           instructor.availableTo.slice(0, 5),
      workingDays:           instructor.workingDays,
      vehicleMake:           instructor.vehicleMake ?? "",
      vehicleModel:          instructor.vehicleModel ?? "",
      vehicleYear:           instructor.vehicleYear ?? "",
      vehicleColour:         instructor.vehicleColour ?? "",
      vehicleRegistration:   instructor.vehicleRegistration ?? "",
      vehicleTransmission:   (instructor.vehicleTransmission as "manual" | "automatic" | "") ?? "",
      insuranceProvider:     instructor.insuranceProvider ?? "",
      insurancePolicyNumber: instructor.insurancePolicyNumber ?? "",
      insuranceExpiryDate:   instructor.insuranceExpiryDate ?? "",
    },
  });

  async function onSubmit(data: ProfileInput) {
    const payload = {
      ...data,
      vehicleYear:         data.vehicleYear === "" || data.vehicleYear == null ? null : Number(data.vehicleYear),
      vehicleTransmission: data.vehicleTransmission === "" ? null : data.vehicleTransmission,
    };
    const res = await fetch("/api/instructor/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else { toast({ title: "Failed to save", description: "Please try again.", variant: "destructive" }); }
  }

  const saveBtn = (
    <Button type="submit" variant="amber" disabled={isSubmitting} className="w-full sm:w-auto">
      {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
        : saved      ? <><CheckCircle2 className="h-4 w-4 mr-2" />Saved!</>
        : "Save Changes"}
    </Button>
  );

  return (
    <div className="space-y-6">

      {/* ── Personal Details ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-navy">Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="relative group flex-shrink-0 focus:outline-none" aria-label="Change profile photo">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-amber transition-all duration-200">
                {displayImage ? (
                  <Image src={displayImage} alt={`${instructor.firstName} ${instructor.lastName}`}
                    width={80} height={80} unoptimized={displayImage.startsWith("/api/")}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-amber/10 flex items-center justify-center">
                    <span className="text-amber font-playfair font-bold text-2xl">{initials}</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                {uploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only" onChange={handleAvatarChange} />
            <div>
              <p className="text-sm font-medium text-foreground">Profile photo</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click to upload · JPEG, PNG, WebP or GIF · Max 5 MB</p>
              {uploading && <p className="text-xs text-amber mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</p>}
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
              <Label>Phone</Label>
              <Input placeholder="07700 000000" {...register("phone")} />
              {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <textarea {...register("bio")} rows={4}
                placeholder="Tell students about yourself, your teaching style and experience…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </div>
            {saveBtn}
          </form>
        </CardContent>
      </Card>

      {/* ── Professional Details ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-navy">Professional Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>DVSA ADI Number</Label>
              <Input value={instructor.dvsaAdiNumber} disabled className="opacity-60 font-mono" />
              <p className="text-xs text-muted-foreground">Contact admin to update your ADI number</p>
            </div>

            <div className="space-y-2">
              <Label>Specialisations</Label>
              <Controller control={control} name="specialisations" render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {SPECIALISATIONS.map((s) => {
                    const checked = field.value.includes(s);
                    return (
                      <button key={s} type="button"
                        onClick={() => field.onChange(checked ? field.value.filter((v) => v !== s) : [...field.value, s])}
                        className={cn("px-3 py-1 rounded-full border text-xs font-medium transition-all",
                          checked ? "bg-navy text-white border-navy" : "bg-transparent text-muted-foreground border-border hover:border-navy/40"
                        )}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              )} />
            </div>

            <div className="space-y-2">
              <Label>Working Days</Label>
              <Controller control={control} name="workingDays" render={({ field }) => (
                <div className="flex gap-2">
                  {DAYS.map(({ label, value }) => {
                    const checked = field.value.includes(value);
                    return (
                      <button key={value} type="button"
                        onClick={() => field.onChange(checked ? field.value.filter((v) => v !== value) : [...field.value, value])}
                        className={cn("w-10 h-10 rounded-lg border text-xs font-semibold transition-all",
                          checked ? "bg-navy text-white border-navy" : "bg-transparent text-muted-foreground border-border hover:border-navy/40"
                        )}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              )} />
            </div>

            <div className="space-y-2">
              <Label>Available Hours</Label>
              <div className="flex items-center gap-3">
                <Input type="time" className="w-36" {...register("availableFrom")} />
                <span className="text-muted-foreground text-sm">to</span>
                <Input type="time" className="w-36" {...register("availableTo")} />
              </div>
              {(errors.availableFrom || errors.availableTo) && <p className="text-destructive text-xs">Please enter valid times</p>}
            </div>

            {saveBtn}
          </form>
        </CardContent>
      </Card>

      {/* ── Vehicle Details ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-navy">Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Make</Label>
                <Input placeholder="e.g. Ford" {...register("vehicleMake")} />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input placeholder="e.g. Fiesta" {...register("vehicleModel")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" placeholder={String(CURRENT_YEAR)} min={1990} max={CURRENT_YEAR + 1}
                  {...register("vehicleYear", { valueAsNumber: false })} />
              </div>
              <div className="space-y-2">
                <Label>Colour</Label>
                <Input placeholder="e.g. Silver" {...register("vehicleColour")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration</Label>
                <Input placeholder="e.g. AB12 CDE" className="uppercase" {...register("vehicleRegistration")} />
              </div>
              <div className="space-y-2">
                <Label>Transmission</Label>
                <select {...register("vehicleTransmission")}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select…</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>
            </div>

            {saveBtn}
          </form>
        </CardContent>
      </Card>

      {/* ── Insurance ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-navy">Insurance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input placeholder="e.g. Adrian Flux" {...register("insuranceProvider")} />
              </div>
              <div className="space-y-2">
                <Label>Policy Number</Label>
                <Input placeholder="e.g. POL-123456" {...register("insurancePolicyNumber")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" className="w-48" {...register("insuranceExpiryDate")} />
            </div>

            {saveBtn}
          </form>

          {/* Insurance document upload — separate from the main form */}
          <div className="mt-6 pt-6 border-t border-border">
            <Label className="mb-2 block">Insurance Document</Label>
            <InsuranceDocUploader currentUrl={instructor.insuranceDocumentUrl} />
          </div>
        </CardContent>
      </Card>

      {/* ── Change Password ──────────────────────────────────────────────── */}
      <ChangePasswordCard />
    </div>
  );
}

// ─── Insurance Document Uploader ──────────────────────────────────────────────

function InsuranceDocUploader({ currentUrl }: { currentUrl: string | null }) {
  const [docUrl, setDocUrl]     = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const hasDoc = !!docUrl;
  const isPdf  = docUrl?.toLowerCase().includes(".pdf") || false;

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum size is 10 MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/instructor/insurance-doc", { method: "POST", body: form });
      if (!res.ok) { const { error } = await res.json().catch(() => ({})); throw new Error(error ?? "Upload failed"); }
      const { url } = await res.json();
      setDocUrl(url);
      toast({ title: "Insurance document uploaded" });
    } catch (err: unknown) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {hasDoc ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
          <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 text-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy">
              {isPdf ? "Insurance document (PDF)" : "Insurance document (image)"}
            </p>
            <p className="text-xs text-muted-foreground">Uploaded successfully</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href="/api/instructor/insurance-doc" target="_blank" rel="noopener noreferrer"
              className="text-xs text-navy hover:underline flex items-center gap-1">
              <ExternalLink className="h-3.5 w-3.5" /> View
            </a>
            <button type="button" onClick={() => { setDocUrl(null); }}
              className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove document">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-amber/50 hover:bg-amber/5 transition-all"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 text-amber animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">Click to upload insurance proof</p>
              <p className="text-xs text-muted-foreground">PDF, JPEG, PNG or WebP · Max 10 MB</p>
            </div>
          )}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only" onChange={handleChange} />

      {hasDoc && (
        <Button type="button" variant="outline" size="sm" disabled={uploading}
          onClick={() => fileInputRef.current?.click()} className="text-xs">
          {uploading ? <><Loader2 className="h-3 w-3 animate-spin mr-1.5" />Uploading…</> : "Replace document"}
        </Button>
      )}
    </div>
  );
}

// ─── Change Password Card ─────────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain one uppercase letter")
      .regex(/[0-9]/, "Must contain one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

function ChangePasswordCard() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved]             = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(data: ChangePasswordInput) {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    });
    if (res.ok) { setSaved(true); reset(); setTimeout(() => setSaved(false), 4000); }
    else {
      const body = await res.json().catch(() => ({}));
      const msg = body.code === "WRONG_PASSWORD" ? "Current password is incorrect."
        : body.code === "NO_PASSWORD" ? "This account uses Google sign-in — no password is set."
        : "Failed to update password. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  }

  function pwField(show: boolean, setShow: (v: boolean) => void, name: keyof ChangePasswordInput, label: string) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="relative">
          <Input type={show ? "text" : "password"} placeholder="••••••••" className="pr-10" {...register(name)} />
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={show ? "Hide" : "Show"}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors[name] && <p className="text-destructive text-xs">{errors[name]?.message}</p>}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-navy">Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {pwField(showCurrent, setShowCurrent, "currentPassword", "Current password")}
          {pwField(showNew,     setShowNew,     "newPassword",     "New password")}
          {pwField(showConfirm, setShowConfirm, "confirmPassword", "Confirm new password")}
          <div className="flex items-center justify-between pt-1">
            <Button type="submit" variant="amber" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Updating…</>
                : saved      ? <><CheckCircle2 className="h-4 w-4 mr-2" />Password updated!</>
                : "Update password"}
            </Button>
            <a href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-4">
              Forgot your password?
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
