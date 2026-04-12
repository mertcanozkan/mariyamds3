"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle, Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ─── Env checks (fetched from a lightweight endpoint) ─────────────────────────

const ENV_LABELS: Record<string, string> = {
  DATABASE_URL: "Database (DATABASE_URL)",
  AUTH_SECRET: "Auth Secret (AUTH_SECRET)",
  AUTH_GOOGLE: "Google OAuth",
  STRIPE_SECRET_KEY: "Stripe Secret Key",
  STRIPE_WEBHOOK_SECRET: "Stripe Webhook Secret",
  RESEND_API_KEY: "Resend API Key",
  BLOB_READ_WRITE_TOKEN: "Vercel Blob",
  NEXTAUTH_URL: "App URL",
};

// ─── Form schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  schoolName: z.string().min(1, "Required"),
  tagline: z.string().optional(),
  contactEmail: z.string().email("Valid email required"),
  phone: z.string().min(1, "Required"),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "Required"),
  postcode: z.string(),
  websiteUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
});

type FormInput = z.infer<typeof schema>;

type Settings = {
  schoolName: string;
  tagline: string | null;
  contactEmail: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  websiteUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  updatedAt: string;
};

function EnvCheck({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-navy">{label}</span>
      {value ? (
        <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" /> Configured
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-destructive text-xs font-medium">
          <AlertCircle className="h-3.5 w-3.5" /> Missing
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [envChecks, setEnvChecks] = useState<Record<string, boolean> | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      schoolName: "",
      tagline: "",
      contactEmail: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postcode: "",
      websiteUrl: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
    },
  });

  useEffect(() => {
    // Load settings
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(({ settings }: { settings: Settings }) => {
        form.reset({
          schoolName: settings.schoolName,
          tagline: settings.tagline ?? "",
          contactEmail: settings.contactEmail,
          phone: settings.phone,
          addressLine1: settings.addressLine1,
          addressLine2: settings.addressLine2 ?? "",
          city: settings.city,
          postcode: settings.postcode,
          websiteUrl: settings.websiteUrl ?? "",
          facebookUrl: settings.facebookUrl ?? "",
          instagramUrl: settings.instagramUrl ?? "",
          twitterUrl: settings.twitterUrl ?? "",
        });
        setLastSaved(settings.updatedAt);
      });

    // Load env status from a public-safe endpoint
    fetch("/api/admin/settings/env")
      .then((r) => r.json())
      .then((data) => setEnvChecks(data.checks))
      .catch(() => setEnvChecks(null));
  }, [form]);

  async function onSubmit(values: FormInput) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setLastSaved(json.settings.updatedAt);
      toast({ title: "Settings saved" });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const allConfigured = envChecks ? Object.values(envChecks).every(Boolean) : null;

  return (
    <div className="lg:pt-0 pt-14 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-navy">Settings</h1>
          {lastSaved && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Last saved {new Date(lastSaved).toLocaleString("en-GB")}
            </p>
          )}
        </div>
        {allConfigured !== null && (
          <Badge variant={allConfigured ? "success" : "warning"}>
            {allConfigured ? "All systems go" : "Setup incomplete"}
          </Badge>
        )}
      </div>

      {/* ── School Info ── */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-navy">School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>School Name</Label>
                <Input {...form.register("schoolName")} placeholder="Mariyam Driving School" />
                {form.formState.errors.schoolName && (
                  <p className="text-xs text-destructive">{form.formState.errors.schoolName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Tagline <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input {...form.register("tagline")} placeholder="Learn to drive with confidence" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Contact Email</Label>
                <Input {...form.register("contactEmail")} type="email" placeholder="hello@example.co.uk" />
                {form.formState.errors.contactEmail && (
                  <p className="text-xs text-destructive">{form.formState.errors.contactEmail.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input {...form.register("phone")} placeholder="020 7123 4567" />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Address ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-navy">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Address Line 1</Label>
              <Input {...form.register("addressLine1")} placeholder="123 High Street" />
            </div>
            <div className="space-y-1.5">
              <Label>Address Line 2 <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input {...form.register("addressLine2")} placeholder="Suite 4" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input {...form.register("city")} placeholder="London" />
                {form.formState.errors.city && (
                  <p className="text-xs text-destructive">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Postcode</Label>
                <Input {...form.register("postcode")} placeholder="SW1A 1AA" className="uppercase" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Online Presence ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-navy">Online Presence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input {...form.register("websiteUrl")} placeholder="https://mariyamds.co.uk" type="url" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Facebook</Label>
                <Input {...form.register("facebookUrl")} placeholder="https://facebook.com/…" type="url" />
              </div>
              <div className="space-y-1.5">
                <Label>Instagram</Label>
                <Input {...form.register("instagramUrl")} placeholder="https://instagram.com/…" type="url" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>X / Twitter</Label>
              <Input {...form.register("twitterUrl")} placeholder="https://x.com/…" type="url" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="amber" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </form>

      {/* ── Environment Variables ── */}
      {envChecks && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-navy">Environment Variables</CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            {Object.entries(ENV_LABELS).map(([key, label]) => (
              <EnvCheck key={key} label={label} value={envChecks[key] ?? false} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Stripe Webhook ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-navy">Stripe Webhook Setup</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>Configure your Stripe webhook to send events to:</p>
          <code className="block bg-slate-100 rounded-lg px-3 py-2 text-xs font-mono text-navy">
            {typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/stripe
          </code>
          <p>Required events:</p>
          <ul className="list-disc list-inside text-xs space-y-1">
            <li><code className="font-mono">checkout.session.completed</code></li>
            <li><code className="font-mono">payment_intent.payment_failed</code></li>
            <li><code className="font-mono">charge.refunded</code></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
