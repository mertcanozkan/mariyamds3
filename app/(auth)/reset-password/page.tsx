"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoBackground } from "@/components/ui/gaming-login";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

// useSearchParams() must live in a component wrapped by <Suspense>
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "invalid">("idle");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="p-8 rounded-2xl backdrop-blur-xl bg-black/55 border border-white/12 shadow-2xl shadow-black/60 text-center space-y-4">
        <XCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h1 className="font-playfair text-2xl font-semibold text-white">Invalid link</h1>
        <p className="text-white/50 text-sm">
          This password reset link is missing or malformed. Please request a new one.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl mt-2">
            Request a reset link
          </Button>
        </Link>
      </div>
    );
  }

  async function onSubmit(data: ResetPasswordInput) {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });

    if (res.ok) {
      setStatus("success");
      setTimeout(() => router.push("/login"), 3000);
    } else {
      setStatus("invalid");
    }
  }

  return (
    <div className="p-8 rounded-2xl backdrop-blur-xl bg-black/55 border border-white/12 shadow-2xl shadow-black/60">
      {status === "success" ? (
        <div className="text-center py-4 space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
          <h2 className="font-playfair text-2xl font-semibold text-white">Password updated</h2>
          <p className="text-white/60 text-sm">
            Your password has been changed successfully. Redirecting you to sign in…
          </p>
          <Link href="/login">
            <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl mt-2">
              Back to sign in
            </Button>
          </Link>
        </div>
      ) : status === "invalid" ? (
        <div className="text-center py-4 space-y-4">
          <XCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h2 className="font-playfair text-2xl font-semibold text-white">Link expired</h2>
          <p className="text-white/60 text-sm">
            This reset link is invalid or has expired. Reset links are valid for 1 hour.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl mt-2">
              Request a new link
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-7">
            <h1 className="font-playfair text-2xl font-semibold text-white mb-1">
              Choose a new password
            </h1>
            <p className="text-white/50 text-sm">
              Must be at least 8 characters with one uppercase letter and one number.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/70 text-sm">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-amber-400/50 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-white/70 text-sm">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-amber-400/50 pr-10"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl py-2.5 mt-2"
            >
              {isSubmitting
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating…</>
                : "Set new password"
              }
            </Button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 mt-5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <VideoBackground videoUrl="https://videos.pexels.com/video-files/8128311/8128311-uhd_2560_1440_25fps.mp4" />
      <div className="relative z-20 w-full max-w-md animate-fade-in">
        <Suspense
          fallback={
            <div className="p-8 rounded-2xl backdrop-blur-xl bg-black/55 border border-white/12 shadow-2xl shadow-black/60 flex items-center justify-center min-h-[200px]">
              <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
