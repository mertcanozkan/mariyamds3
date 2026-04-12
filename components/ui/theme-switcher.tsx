"use client";

import { useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import { useTheme, THEMES, type ThemeName } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  /** Pass 'light' when the switcher sits on a light background (e.g. sidebar) */
  variant?: "dark" | "light";
  /** Open the popover upward — use when the trigger is near the bottom of the viewport */
  dropUp?: boolean;
  className?: string;
}

export function ThemeSwitcher({ variant = "dark", dropUp = false, className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const isDark = variant === "dark";
  const currentTheme = THEMES.find((t) => t.name === theme)!;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change colour scheme"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          isDark
            ? "text-white/70 hover:text-white hover:bg-white/10"
            : "text-foreground/70 hover:text-foreground hover:bg-black/5"
        )}
      >
        {/* Mini swatch showing the active theme */}
        <span className="relative w-4 h-4 rounded-full flex-shrink-0 ring-1 ring-white/20 overflow-hidden">
          <span
            className="absolute inset-0"
            style={{ background: currentTheme.primary }}
          />
          <span
            className="absolute inset-0"
            style={{
              background: currentTheme.accent,
              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
            }}
          />
        </span>
        <Palette className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline text-xs leading-none">Theme</span>
      </button>

      {/* Popover */}
      {open && (
        <div
          role="dialog"
          aria-label="Choose colour scheme"
          className={cn(
            "absolute right-0 z-[60] min-w-[200px] rounded-2xl p-4 shadow-2xl",
            dropUp ? "bottom-full mb-2" : "top-full mt-2",
            "border backdrop-blur-2xl",
            isDark
              ? "bg-white/10 border-white/15 text-white"
              : "bg-white/95 border-black/10 text-foreground shadow-black/10"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.12em] mb-3 px-0.5",
              isDark ? "text-white/40" : "text-black/40"
            )}
          >
            Colour Scheme
          </p>

          <div className="grid grid-cols-3 gap-2 min-w-[216px]">
            {THEMES.map((t) => {
              const active = theme === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => {
                    setTheme(t.name as ThemeName);
                    setOpen(false);
                  }}
                  title={t.label}
                  aria-pressed={active}
                  className={cn(
                    "group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-150",
                    isDark
                      ? active
                        ? "bg-white/20 ring-1 ring-white/40"
                        : "hover:bg-white/10"
                      : active
                      ? "bg-black/8 ring-1 ring-black/20"
                      : "hover:bg-black/5"
                  )}
                >
                  {/* Split-circle swatch */}
                  <span
                    className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 transition-transform duration-150 group-hover:scale-110"
                    style={{
                      boxShadow: active
                        ? `0 0 0 2.5px ${t.accent}, 0 0 12px ${t.accent}55`
                        : "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* Primary (top-left half) */}
                    <span
                      className="absolute inset-0"
                      style={{ background: t.primary }}
                    />
                    {/* Accent (bottom-right triangle) */}
                    <span
                      className="absolute inset-0"
                      style={{
                        background: t.accent,
                        clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                      }}
                    />
                    {/* Active check */}
                    {active && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2.5 7L5.5 10L11.5 4"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </span>

                  <span
                    className={cn(
                      "text-[10px] leading-none font-medium transition-colors",
                      isDark
                        ? active
                          ? "text-white"
                          : "text-white/60 group-hover:text-white/90"
                        : active
                        ? "text-foreground"
                        : "text-foreground/50 group-hover:text-foreground/80"
                    )}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
