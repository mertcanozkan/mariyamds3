"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Loader2, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  registerStep1Schema,
  instructorStep2Schema,
  instructorStep3Schema,
  type RegisterStep1Input,
  type InstructorStep2Input,
  type InstructorStep3Input,
} from "@/lib/validations/auth";

const STEPS = ["Account", "Personal Details", "Professional Info"];

export default function InstructorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<RegisterStep1Input & InstructorStep2Input & InstructorStep3Input>>({});

  const step1 = useForm<RegisterStep1Input>({ resolver: zodResolver(registerStep1Schema) });
  const step2 = useForm<InstructorStep2Input>({ resolver: zodResolver(instructorStep2Schema) });
  const step3 = useForm<InstructorStep3Input>({ resolver: zodResolver(instructorStep3Schema) });

  async function onStep1(data: RegisterStep1Input) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(1);
  }

  async function onStep2(data: InstructorStep2Input) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  }

  async function onStep3(data: InstructorStep3Input) {
    const payload = { ...formData, ...data };
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register-instructor", {
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

      router.push("/instructor/pending");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy to-navy-800 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl p-8">

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

          {/* Step 0: Account */}
          {step === 0 && (
            <form onSubmit={step1.handleSubmit(onStep1)} className="space-y-4">
              <h2 className="font-playfair text-xl font-bold text-navy">Create your instructor account</h2>
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
                Not an instructor?{" "}
                <Link href="/register" className="text-navy hover:underline">Go back</Link>
              </p>
            </form>
          )}

          {/* Step 1: Personal details */}
          {step === 1 && (
            <form onSubmit={step2.handleSubmit(onStep2)} className="space-y-4">
              <h2 className="font-playfair text-xl font-bold text-navy">Your personal details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input placeholder="James" {...step2.register("firstName")} />
                  {step2.formState.errors.firstName && <p className="text-destructive text-xs">{step2.formState.errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input placeholder="Smith" {...step2.register("lastName")} />
                  {step2.formState.errors.lastName && <p className="text-destructive text-xs">{step2.formState.errors.lastName.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone number</Label>
                <Input placeholder="07700 900000" {...step2.register("phone")} />
                {step2.formState.errors.phone && <p className="text-destructive text-xs">{step2.formState.errors.phone.message}</p>}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(0)}>← Back</Button>
                <Button type="submit" variant="amber" size="lg" className="flex-1">Continue →</Button>
              </div>
            </form>
          )}

          {/* Step 2: Professional details */}
          {step === 2 && (
            <form onSubmit={step3.handleSubmit(onStep3)} className="space-y-4">
              <h2 className="font-playfair text-xl font-bold text-navy">Your professional details</h2>
              <div className="space-y-2">
                <Label htmlFor="dvsaAdiNumber">DVSA ADI number</Label>
                <Input id="dvsaAdiNumber" placeholder="e.g. 123456" {...step3.register("dvsaAdiNumber")} />
                {step3.formState.errors.dvsaAdiNumber && <p className="text-destructive text-xs">{step3.formState.errors.dvsaAdiNumber.message}</p>}
                <p className="text-xs text-muted-foreground">Your Approved Driving Instructor registration number</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Short bio (optional)</Label>
                <textarea
                  id="bio"
                  rows={3}
                  placeholder="Tell students a bit about yourself and your teaching style..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  {...step3.register("bio")}
                />
                {step3.formState.errors.bio && <p className="text-destructive text-xs">{step3.formState.errors.bio.message}</p>}
              </div>

              <div className="rounded-lg bg-amber/10 border border-amber/20 p-3 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-amber flex-shrink-0 mt-0.5" />
                <p className="text-xs text-navy">
                  Your account will be reviewed by an admin before you can accept students. You&apos;ll be notified once approved.
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
                <Button type="submit" variant="amber" size="lg" className="flex-1" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit Application"}
                </Button>
              </div>
            </form>
          )}

          {step !== 0 && (
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
