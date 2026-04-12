"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, BookOpen, CalendarCheck, BadgeCheck } from "lucide-react";

const STEPS = [
  { icon: UserPlus,     title: "Register",        description: "Create your account in minutes. No upfront payment required." },
  { icon: BookOpen,     title: "Choose a Course",  description: "Select the package that suits your experience level and goals." },
  { icon: CalendarCheck,title: "Book a Lesson",    description: "Pick your instructor, choose a time, and pay securely online." },
  { icon: BadgeCheck,   title: "Pass Your Test",   description: "Arrive confident, prepared, and ready to earn your licence." },
] as const;

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 bg-navy relative overflow-hidden">

      {/* ── Decorative rings ─────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full border border-white/[0.05]" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full border border-white/[0.04]" />
        {/* Accent glow bottom centre */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] blur-3xl opacity-15"
          style={{ background: "var(--theme-accent-hex)" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">

        {/* ── Section header ──────────────────────────────────── */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="font-semibold text-sm uppercase tracking-[0.15em]"
            style={{ color: "var(--theme-accent-hex)" }}
          >
            Simple Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-5xl sm:text-6xl font-bold text-white mt-3"
          >
            How It Works
          </motion.h2>
        </div>

        {/* ── Steps timeline ──────────────────────────────────── */}
        <div className="relative">

          {/* Animated connector line — draws left to right on scroll */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left center" }}
            className="hidden lg:block absolute top-[2.875rem] left-[12.5%] right-[12.5%] h-px"
            aria-hidden="true"
          >
            {/* Dashed style using repeating gradient */}
            <div
              className="w-full h-full"
              style={{
                background: `repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 12px, transparent 12px, transparent 20px)`,
              }}
            />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 36 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    delay: 0.35 + i * 0.18,
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex flex-col items-center text-center relative"
                >
                  {/* Circle stack: outer ring → inner fill → icon */}
                  <div className="relative mb-7 flex-shrink-0">
                    {/* Pulsing outer glow ring */}
                    <div
                      className="absolute inset-0 rounded-full animate-pulse-ring"
                      style={{
                        border: `2px solid var(--theme-accent-hex)`,
                        transform: "scale(1.25)",
                        opacity: 0.2,
                      }}
                    />
                    {/* Main circle */}
                    <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-white/8 border-2 border-white/20 flex items-center justify-center relative z-10">
                      <Icon
                        className="h-7 w-7"
                        style={{ color: "var(--theme-accent-hex)" }}
                        aria-hidden="true"
                      />
                    </div>
                    {/* Step number badge */}
                    <div
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shadow-lg z-20"
                      style={{
                        background: "var(--theme-accent-hex)",
                        color: "var(--theme-accent-hex) === '#A8D455' ? '#0e0e0e' : 'hsl(var(--accent-foreground))'",
                      }}
                    >
                      <span className="text-accent-foreground font-bold text-xs">{i + 1}</span>
                    </div>
                  </div>

                  <h3 className="font-playfair text-xl font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed max-w-[200px]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
