"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { VideoBackground, LoginForm } from "@/components/ui/gaming-login";

function roleRedirect(role: string | undefined) {
  if (role === "admin") return "/admin";
  if (role === "instructor") return "/instructor/pending";
  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();

  async function handleLogin(email: string, password: string, _remember: boolean) {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast({
        title: "Sign in failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
      // Re-throw so LoginForm keeps isSubmitting false without success state
      throw new Error(result.error);
    }

    // Fetch the freshly-created session to read the role, then route accordingly
    const session = await getSession();
    router.push(roleRedirect(session?.user?.role));
    router.refresh();
  }

  function handleGoogleSignIn() {
    // Google users are always students; complete-profile handles missing profile
    signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <VideoBackground videoUrl="https://videos.pexels.com/video-files/8128311/8128311-uhd_2560_1440_25fps.mp4" />

      <div className="relative z-20 w-full max-w-md animate-fade-in">
        <LoginForm onSubmit={handleLogin} onGoogleSignIn={handleGoogleSignIn} />
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/40 text-xs z-20">
        © {new Date().getFullYear()} Mariyam Driving School. All rights reserved.
      </footer>
    </div>
  );
}
