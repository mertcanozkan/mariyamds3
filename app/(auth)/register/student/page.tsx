"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  registerStep1Schema, registerStep2Schema, registerStep3Schema,
  type RegisterStep1Input, type RegisterStep2Input, type RegisterStep3Input,
} from "@/lib/validations/auth";

const STEPS_FULL = ["Account", "Personal Details", "Driving Info"];
const STEPS_OAUTH = ["Personal Details", "Driving Info"];

export default function StudentRegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isOAuth = status === "authenticated";

  const STEPS = isOAuth ? STEPS_OAUTH : STEPS_FULL;
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<RegisterStep1Input & RegisterStep2Input & RegisterStep3Input>>({});

  useEffect(() => {}, []);

  const step1 = useForm<RegisterStep1Input>({ resolver: zodResolver(registerStep1Schema) });
  const step2 = useForm<RegisterStep2Input>({ resolver: zodResolver(registerStep2Schema) });
  const step3 = useForm<RegisterStep3Input>({ resolver: zodResolver(registerStep3Schema) });

  const formStep = isOAuth ? step + 1 : step;

  async function onStep1(data: RegisterStep1Input) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(1);
  }

  async function onStep2(data: RegisterStep2Input) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(isOAuth ? 1 : 2);
  }

  async function onStep3(data: RegisterStep3Input) {
    const payload = { ...formData, ...data };
    setIsLoading(true);
    try {
      if (isOAuth) {
        const res = await fetch("/api/auth/complete-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          toast({ title: "Profile setup failed", description: err.error, variant: "destructive" });
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, passwordHash: formData.password }),
        });

        if (!res.ok) {
          const err = await res.json();
          toast({ title: "Registration failed", description: err.error, variant: "destructive" });
          return;
        }

        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy to-navy-800 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {isOAuth && (
            <div className="mb-6 p-3 rounded-lg bg-amber/10 border border-amber/20 text-sm text-navy">
              <strong>Almost there!</strong> Please complete your profile to access your dashboard.
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step ? "bg-green-500 text-white" : i === step ? "bg-amber text-navy" : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-navy" : "text-muted-foreground"}`}>{label}</span>
                {i < STEPS.length - 1 && <div className="w-8 h-px bg-border mx-1 hidden sm:block" />}
              </div>
            ))}
          </div>

          {/* Step 0: Account creation (email/password only) */}
          {!isOAuth && step === 0 && (
            <form onSubmit={step1.handleSubmit(onStep1)} className="space-y-4">
              <h2 className="font-playfair text-xl font-bold text-navy">Create your account</h2>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...step1.register("email")} />
                {step1.formState.errors.email && <p className="text-destructive text-xs">{step1.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Min. 8 characters" {...step1.register("password")} />
                {step1.formState.errors.password && <p className="text-destructive text-xs">{step1.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" placeholder="Repeat your password" {...step1.register("confirmPassword")} />
                {step1.formState.errors.confirmPassword && <p className="text-destructive text-xs">{step1.formState.errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" variant="amber" size="lg" className="w-full">Continue →</Button>
              <p className="text-center text-xs text-muted-foreground">
                Not a student?{" "}
                <Link href="/register" className="text-navy hover:underline">Go back</Link>
              </p>
            </form>
          )}

          {/* Step 1 (or step 0 for OAuth): Personal details */}
          {formStep === 1 && (
            <form onSubmit={step2.handleSubmit(onStep2)} className="space-y-4">
              <h2 className="font-playfair text-xl font-bold text-navy">Your personal details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input placeholder="Sophie" {...step2.register("firstName")} />
                  {step2.formState.errors.firstName && <p className="text-destructive text-xs">{step2.formState.errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input placeholder="Clarke" {...step2.register("lastName")} />
                  {step2.formState.errors.lastName && <p className="text-destructive text-xs">{step2.formState.errors.lastName.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone number</Label>
                <Input placeholder="07700 900000" {...step2.register("phone")} />
                {step2.formState.errors.phone && <p className="text-destructive text-xs">{step2.formState.errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Date of birth</Label>
                <Input type="date" {...step2.register("dateOfBirth")} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="123 Example Street" {...step2.register("addressLine1")} />
                <Input placeholder="Flat / unit (optional)" {...step2.register("addressLine2")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="London" {...step2.register("city")} />
                </div>
                <div className="space-y-2">
                  <Label>Postcode</Label>
                  <Input placeholder="E1 6RF" {...step2.register("postcode")} />
                  {step2.formState.errors.postcode && <p className="text-destructive text-xs">{step2.formState.errors.postcode.message}</p>}
                </div>
              </div>
              <div className="flex gap-3">
                {!isOAuth && (
                  <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(0)}>← Back</Button>
                )}
                <Button type="submit" variant="amber" size="lg" className={isOAuth ? "w-full" : "flex-1"}>Continue →</Button>
              </div>
            </form>
          )}

          {/* Step 2 (or step 1 for OAuth): Driving experience */}
          {formStep === 2 && (
            <form onSubmit={step3.handleSubmit(onStep3)} className="space-y-4">
              <h2 className="font-playfair text-xl font-bold text-navy">Your driving experience</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <input type="checkbox" {...step3.register("hasProvLicence")} className="rounded" />
                  <div>
                    <div className="font-medium text-sm">I have a provisional driving licence</div>
                    <div className="text-muted-foreground text-xs">Required to take lessons in the UK</div>
                  </div>
                </label>
                <div className="space-y-2">
                  <Label>Provisional licence number (optional)</Label>
                  <Input placeholder="MORGA657054SM9IJ" {...step3.register("provisionalLicenceNumber")} />
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <input type="checkbox" {...step3.register("hasPreviousLessons")} className="rounded" />
                  <div>
                    <div className="font-medium text-sm">I&apos;ve had driving lessons before</div>
                    <div className="text-muted-foreground text-xs">Tell us about your previous experience</div>
                  </div>
                </label>
                <div className="space-y-2">
                  <Label>Approximate previous lesson hours</Label>
                  <Input type="number" min="0" max="200" placeholder="0" {...step3.register("previousLessonsHours")} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(isOAuth ? 0 : 1)}>← Back</Button>
                <Button type="submit" variant="amber" size="lg" className="flex-1" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> {isOAuth ? "Saving..." : "Creating account..."}</> : isOAuth ? "Complete Profile" : "Create Account"}
                </Button>
              </div>
            </form>
          )}

          {!isOAuth && step !== 0 && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-navy font-semibold hover:underline">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
