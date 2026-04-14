import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Home, UserCircle, LayoutDashboard } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

interface Props {
  firstName: string;
}

export function InstructorPortalHeader({ firstName }: Props) {
  return (
    <header className="bg-navy border-b border-white/10 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest">Instructor Portal</p>
          <h1 className="font-playfair text-xl font-bold text-white mt-0.5">
            Welcome, {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="text-xs">Active</Badge>
          <Link
            href="/instructor/dashboard"
            className="text-white/60 hover:text-white transition-colors"
            title="Dashboard"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Link>
          <Link
            href="/instructor/profile"
            className="text-white/60 hover:text-white transition-colors"
            title="My profile"
          >
            <UserCircle className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="text-white/60 hover:text-white transition-colors"
            title="Back to website"
          >
            <Home className="h-4 w-4" />
          </Link>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
