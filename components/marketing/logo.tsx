"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Scale preset — controls overall size */
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Wrap in an anchor tag to the homepage (default: true) */
  asLink?: boolean;
}

const sizeMap = {
  sm: {
    mariyam: "text-lg",          // ~18px
    ds:      "text-base",        // ~16px
    sub:     "text-[7px]",
    dots:    "w-[4px] h-[4px]",
    gap:     "gap-[3px]",
    mx:      "mx-1",
    rule:    "mt-[3px] mb-[3px]",
  },
  md: {
    mariyam: "text-[22px]",
    ds:      "text-[18px]",
    sub:     "text-[8.5px]",
    dots:    "w-[5px] h-[5px]",
    gap:     "gap-[3.5px]",
    mx:      "mx-[5px]",
    rule:    "mt-1 mb-[3px]",
  },
  lg: {
    mariyam: "text-4xl",         // ~36px
    ds:      "text-3xl",
    sub:     "text-[11px]",
    dots:    "w-[7px] h-[7px]",
    gap:     "gap-[5px]",
    mx:      "mx-2",
    rule:    "mt-1.5 mb-1",
  },
};

function LogoMark({ size = "md", className }: Omit<LogoProps, "asLink">) {
  const s = sizeMap[size];

  return (
    <div className={cn("group flex flex-col leading-none select-none", className)}>
      {/* ── Wordmark row ── */}
      <div className="flex items-baseline">

        {/* MARIYAM — Cormorant italic, fancy */}
        <span
          className={cn(
            "font-playfair italic font-medium text-white tracking-[0.04em] leading-none",
            "transition-colors duration-200 group-hover:text-white/90",
            s.mariyam
          )}
        >
          MARIYAM
        </span>

        {/* Colon — two accent dots, vertically centred between cap-height and baseline */}
        <span
          className={cn(
            "flex flex-col items-center self-center",
            s.gap, s.mx,
            "translate-y-[-1px]"   /* optical alignment */
          )}
          aria-hidden="true"
        >
          <span
            className={cn("rounded-full transition-transform duration-200 group-hover:scale-110", s.dots)}
            style={{ background: "var(--theme-accent-hex)" }}
          />
          <span
            className={cn("rounded-full transition-transform duration-200 group-hover:scale-110", s.dots)}
            style={{ background: "var(--theme-accent-hex)" }}
          />
        </span>

        {/* DS — Jost extrabold, modern */}
        <span
          className={cn(
            "font-dm font-extrabold text-white tracking-[0.18em] leading-none",
            "transition-colors duration-200 group-hover:text-white/90",
            s.ds
          )}
        >
          DS
        </span>
      </div>

      {/* ── Amber gradient rule ── */}
      <div
        className={cn("h-px transition-opacity duration-200 opacity-50 group-hover:opacity-80", s.rule)}
        style={{
          background:
            "linear-gradient(to right, var(--theme-accent-hex) 0%, color-mix(in srgb, var(--theme-accent-hex) 25%, transparent) 60%, transparent 100%)",
        }}
      />

      {/* ── Sub-label ── */}
      <span
        className={cn(
          "font-dm font-medium uppercase tracking-[0.38em] text-white/35",
          "transition-colors duration-200 group-hover:text-white/50",
          s.sub
        )}
      >
        Driving School
      </span>
    </div>
  );
}

export function Logo({ size = "md", className, asLink = true }: LogoProps) {
  if (!asLink) return <LogoMark size={size} className={className} />;

  return (
    <Link href="/" className={cn("flex-shrink-0", className)}>
      <LogoMark size={size} />
    </Link>
  );
}
