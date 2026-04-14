"use client";

import Link from "next/link";
import { GraduationCap, Car } from "lucide-react";

export default function RegisterRolePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy to-navy-800 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-playfair text-2xl font-bold text-navy">Create an account</h1>
            <p className="text-muted-foreground text-sm mt-2">Are you joining as a student or an instructor?</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/register/student"
              className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-amber hover:bg-amber/5 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-full bg-navy/5 group-hover:bg-amber/10 flex items-center justify-center transition-colors">
                <GraduationCap className="h-7 w-7 text-navy group-hover:text-amber transition-colors" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-navy text-sm">Student</div>
                <div className="text-muted-foreground text-xs mt-0.5">Book lessons &amp; track progress</div>
              </div>
            </Link>

            <Link
              href="/register/instructor"
              className="group flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-amber hover:bg-amber/5 transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-full bg-navy/5 group-hover:bg-amber/10 flex items-center justify-center transition-colors">
                <Car className="h-7 w-7 text-navy group-hover:text-amber transition-colors" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-navy text-sm">Instructor</div>
                <div className="text-muted-foreground text-xs mt-0.5">Teach &amp; manage your students</div>
              </div>
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-navy font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
