"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Logo } from "@/components/marketing/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "Work With Us", href: "/work-with-us" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

function UserAvatar({ name, image, size = 32 }: { name?: string | null; image?: string | null; size?: number }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // Private blob URLs must be served via our proxy; OAuth URLs are public already
  const src = image?.includes("blob.vercel-storage.com")
    ? "/api/profile/avatar-url"
    : image ?? null;

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "User avatar"}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        unoptimized={src.startsWith("/api/")}
      />
    );
  }

  return (
    <span
      className="rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center text-xs select-none flex-shrink-0"
      style={{ width: size, height: size }}
      aria-label={name ?? "User"}
    >
      {initials}
    </span>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  const isInstructor = user.role === "instructor";
  const dashboardHref = isInstructor ? "/instructor/dashboard" : "/dashboard";
  const profileHref   = isInstructor ? "/instructor/profile"   : "/dashboard/profile";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 rounded-full p-0.5 ring-2 ring-transparent hover:ring-accent/60 focus:ring-accent/60 focus:outline-none transition-all duration-200"
          aria-label="Open user menu"
        >
          <UserAvatar name={user.name} image={user.image} size={32} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className={cn(
            "z-[100] min-w-[210px] rounded-xl overflow-hidden",
            "bg-primary/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/40",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          )}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} image={user.image} size={36} />
              <div className="min-w-0">
                {user.name && (
                  <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                )}
                <p className="text-white/50 text-xs truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5 space-y-0.5">
            <DropdownMenu.Item asChild>
              <Link
                href={dashboardHref}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 focus:text-white focus:bg-white/10 focus:outline-none cursor-pointer transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-accent flex-shrink-0" />
                Dashboard
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <Link
                href={profileHref}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 focus:text-white focus:bg-white/10 focus:outline-none cursor-pointer transition-colors"
              >
                <User className="h-4 w-4 text-accent flex-shrink-0" />
                My Profile
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 h-px bg-white/10" />

            <DropdownMenu.Item asChild>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10 focus:outline-none cursor-pointer transition-colors"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                Sign Out
              </button>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isInstructor  = session?.user?.role === "instructor";
  const dashboardHref = isInstructor ? "/instructor/dashboard" : "/dashboard";
  const profileHref   = isInstructor ? "/instructor/profile"   : "/dashboard/profile";

  const isTransparent = !scrolled && pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isTransparent
          ? "bg-transparent"
          : "bg-primary/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-white/10"
      )}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              {link.href === "/work-with-us" ? (
                <Link
                  href={link.href}
                  className="px-3 py-1.5 text-amber text-sm font-semibold transition-colors rounded-lg hover:bg-amber/10 border border-amber/30 hover:border-amber/60"
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  href={link.href}
                  className="px-3 py-2 text-white/80 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-white/10"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <ThemeSwitcher variant="dark" />
          <div className="w-px h-5 bg-white/20 mx-1" />

          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 h-8"
                asChild
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground font-bold hover:bg-accent/90 shadow-md h-8 px-4"
                asChild
              >
                <Link href="/register">Book a Lesson</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile: theme switcher + avatar (if logged in) + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeSwitcher variant="dark" />
          {isLoggedIn && <UserMenu />}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden bg-primary/97 backdrop-blur-xl border-t border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 rounded-lg transition-colors text-sm font-medium",
                    link.href === "/work-with-us"
                      ? "text-amber hover:bg-amber/10 border border-amber/20 hover:border-amber/40"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 flex flex-col gap-2 border-t border-white/10">
                {isLoggedIn ? (
                  <>
                    <Link
                      href={dashboardHref}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                    >
                      <LayoutDashboard className="h-4 w-4 text-accent" />
                      Dashboard
                    </Link>
                    <Link
                      href={profileHref}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                    >
                      <User className="h-4 w-4 text-accent" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="text-white/80 hover:text-white hover:bg-white/10 justify-start h-10"
                      asChild
                    >
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        Log In
                      </Link>
                    </Button>
                    <Button
                      className="bg-accent text-accent-foreground font-bold hover:bg-accent/90"
                      asChild
                    >
                      <Link href="/register" onClick={() => setMobileOpen(false)}>
                        Book a Lesson
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
