"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, CalendarDays, PoundSterling, Trophy } from "lucide-react";

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Experienced ADI Instructors",
    description: "All our instructors hold full DVSA Approved Driving Instructor (ADI) qualifications with years of London road experience.",
  },
  {
    icon: CalendarDays,
    title: "Flexible Lesson Times",
    description: "Early morning, evening, and weekend slots available. We fit around your schedule, not the other way round.",
  },
  {
    icon: PoundSterling,
    title: "Competitive Pricing",
    description: "Transparent, all-inclusive pricing with package discounts. No hidden fees. Pay online securely.",
  },
  {
    icon: Trophy,
    title: "High First-Time Pass Rate",
    description: "Our structured approach and comprehensive test preparation has earned us a first-time pass rate well above the national average.",
  },
] as const;

export function WhyChooseUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">

      {/* Background watermark */}
      <div
        className="absolute -top-8 right-0 font-playfair font-bold select-none pointer-events-none leading-none text-[clamp(6rem,18vw,16rem)] text-navy/[0.025]"
        aria-hidden="true"
      >
        Why
      </div>

      <div className="container mx-auto px-4">

        {/* ── Split section header ─────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-16">
          <div className="flex-1">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-amber font-semibold text-sm uppercase tracking-[0.15em]"
            >
              Why Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="font-playfair text-5xl sm:text-6xl font-bold text-navy mt-2 leading-tight"
            >
              The Mariyam<br />Difference
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="text-muted-foreground lg:max-w-xs lg:text-right leading-relaxed"
          >
            We combine professional instruction with a genuinely supportive
            learning environment — because confidence on the road starts here.
          </motion.p>
        </div>

        {/* ── Border-grid cards ────────────────────────────────── */}
        {/*   gap-0.5 + bg-border creates the thin dividing lines   */}
        <div className="grid sm:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden shadow-sm">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative bg-white p-8 sm:p-10 group overflow-hidden hover:bg-slate-50/70 transition-colors duration-300"
              >
                {/* Watermark step number */}
                <span
                  className="absolute top-5 right-6 font-playfair font-bold text-7xl text-navy/[0.05] select-none pointer-events-none leading-none"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-amber/10 flex items-center justify-center mb-6 group-hover:bg-amber/18 transition-colors duration-300 relative">
                  <Icon className="h-7 w-7 text-amber" aria-hidden="true" />
                </div>

                {/* Text */}
                <h3 className="font-playfair font-bold text-navy text-xl mb-3 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Animated accent underline slides in on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                  aria-hidden="true"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
