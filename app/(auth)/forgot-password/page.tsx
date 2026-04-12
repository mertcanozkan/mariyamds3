"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoBackground } from "@/components/ui/gaming-login";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordInput) {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // Always show success — prevents user enumeration
    setSubmitted(true);
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <VideoBackground videoUrl="https://videos.pexels.com/video-files/8128311/8128311-uhd_2560_1440_25fps.mp4" />

      <div className="relative z-20 w-full max-w-md animate-fade-in">
        <div className="p-8 rounded-2xl backdrop-blur-xl bg-black/55 border border-white/12 shadow-2xl shadow-black/60">

          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7 text-green-400" />
              </div>
              <h2 className="font-playfair text-2xl font-semibold text-white">Check your inbox</h2>
              <p className="text-white/55 text-sm leading-relaxed">
                If that address is registered, we&apos;ve sent a reset link. It expires in&nbsp;1&nbsp;hour.
                <br />
                Don&apos;t forget to check your spam folder.
              </p>
              <Link href="/login">
                <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl mt-2">
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="font-playfair text-2xl font-semibold text-white mb-1">
                  Reset your password
                </h1>
                <p className="text-white/50 text-sm">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-white/70 text-sm">Email address</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Mail className="h-4 w-4 text-white/40" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="pl-9 bg-white/6 border-white/10 text-white placeholder-white/30 focus:border-amber-400/50"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl py-2.5"
                >
                  {isSubmitting
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending…</>
                    : "Send reset link"
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
      </div>
    </div>
  );
}
