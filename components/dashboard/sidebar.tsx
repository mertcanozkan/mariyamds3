"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Calendar, BookOpen, TrendingUp,
  CreditCard, User, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Book a Lesson", href: "/dashboard/book", icon: Calendar },
  { label: "My Lessons", href: "/dashboard/lessons", icon: BookOpen },
  { label: "Progress", href: "/dashboard/progress", icon: TrendingUp },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
] as const;

interface SidebarProps {
  user: { name?: string | null; email: string; image?: string | null };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
            <span className="text-accent-foreground font-bold text-sm">M</span>
          </div>
          <div>
            <div className="font-playfair font-bold text-primary text-sm leading-tight">Mariyam DS</div>
            <div className="text-muted-foreground text-[10px] leading-tight">Student Portal</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5" aria-label="Dashboard navigation">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
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
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Theme switcher + User + logout */}
      <div className="p-4 border-t border-border space-y-2">
        {/* Theme row */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs text-muted-foreground font-medium">Theme</span>
          <ThemeSwitcher variant="light" dropUp />
        </div>

        {/* User row */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
            {user.email[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-primary truncate">{user.name ?? user.email}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
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
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-border h-screen sticky top-0 flex-shrink-0">
        {NavContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-border h-14 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-sm">M</span>
          </div>
          <span className="font-playfair font-bold text-primary text-sm">Mariyam DS</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          className="p-2 rounded-md hover:bg-muted text-primary transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="w-64 bg-white border-r border-border h-full overflow-y-auto pt-14">
            {NavContent}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
