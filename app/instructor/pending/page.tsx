"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstructorPendingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/instructor/status")
        .then((r) => r.json())
        .then(({ isActive }) => {
          if (isActive) {
            router.replace("/instructor/dashboard");
          } else {
            setChecked(true);
          }
        })
        .catch(() => setChecked(true));
    }
  }, [status, router]);

  if (status === "loading" || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy to-navy-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-amber" />
          </div>
          <h1 className="font-playfair text-2xl font-bold text-navy mb-2">Application received</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Thank you for registering as an instructor. Your application is being reviewed by our admin team.
            You&apos;ll be notified by email once your account has been approved.
          </p>

          <div className="rounded-lg bg-muted/50 border border-border p-4 text-left space-y-2 mb-6">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-navy">What happens next?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  An admin will verify your DVSA ADI number and activate your account. This usually takes 1–2 business days.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-navy"
            disabled={signingOut}
            onClick={handleSignOut}
          >
            {signingOut ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
