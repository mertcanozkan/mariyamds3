"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, Calendar, BookOpen,
  GraduationCap, CreditCard, Settings, LogOut, Menu, X, Tag, Home,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
  { label: "Lessons", href: "/admin/lessons", icon: BookOpen },
  { label: "Instructors", href: "/admin/instructors", icon: GraduationCap },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Promotions", href: "/admin/promotions", icon: Tag },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Settings", href: "/admin/settings", icon: Settings },
] as const;

interface Props {
  user: { name?: string | null; email: string };
  pendingInstructors?: number;
}

export function AdminSidebar({ user, pendingInstructors = 0 }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
            <span className="text-accent font-bold text-sm">A</span>
          </div>
          <div>
            <div className="font-playfair font-bold text-primary text-sm leading-tight">Admin Panel</div>
            <div className="text-muted-foreground text-[10px] leading-tight">Mariyam DS</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/admin" && pathname.startsWith(href));
          const badge = label === "Instructors" && pendingInstructors > 0 ? pendingInstructors : null;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary hover:bg-muted"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {badge !== null && (
                <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-amber text-navy text-[10px] font-bold flex items-center justify-center px-1 leading-none">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme + User + logout */}
      <div className="p-4 border-t border-border space-y-2">
        {/* Theme row */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs text-muted-foreground font-medium">Theme</span>
          <ThemeSwitcher variant="light" dropUp />
        </div>

        {/* Back to website */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Back to Website
        </Link>

        {/* Switch to student portal */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        >
          Student Portal
        </Link>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
            {user.email[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-primary truncate">
              {user.name ?? user.email}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-60 flex-col bg-white border-r border-border h-screen sticky top-0 flex-shrink-0">
        {NavContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-border h-14 flex items-center justify-between px-4">
        <span className="font-playfair font-bold text-primary text-sm">Admin</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          className="p-2 rounded-md hover:bg-muted text-primary transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="w-60 bg-white border-r border-border h-full overflow-y-auto pt-14">
            {NavContent}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
