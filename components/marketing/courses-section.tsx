"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Course } from "@/lib/db/schema";

interface CoursesSectionProps {
  courses: Course[];
}

export function CoursesSection({ courses }: CoursesSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const featured = courses.filter((c) => c.isFeatured);
  const regular = courses.filter((c) => !c.isFeatured);

  return (
    <section id="courses" ref={ref} className="py-24 bg-slate-50/70">
      <div className="container mx-auto px-4">

        {/* ── Section header ──────────────────────────────────── */}
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-amber font-semibold text-sm uppercase tracking-[0.15em]"
          >
            Courses & Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.09 }}
            className="font-playfair text-5xl sm:text-6xl font-bold text-navy mt-2"
          >
            Choose Your Package
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-muted-foreground mt-3 max-w-lg mx-auto"
          >
            From first-time learners to test-day preparation — we have a course for every stage.
          </motion.p>
        </div>

        {/* ── Featured course(s) — dark horizontal card ───────── */}
        {featured.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden mb-8 gradient-navy noise-overlay"
          >
            {/* Accent glow blob */}
            <div
              className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-25 -translate-y-1/3 translate-x-1/4"
              style={{ background: "var(--theme-accent-hex)" }}
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-10"
              style={{ background: "var(--theme-accent-hex)" }}
              aria-hidden="true"
            />

            <div className="relative z-10 p-8 md:p-10 md:flex gap-10 items-start">

              {/* ── Left: details ────────────────────────────── */}
              <div className="flex-1 mb-8 md:mb-0">
                {/* Top badges */}
                <div className="flex items-center flex-wrap gap-3 mb-5">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{
                      background: "var(--theme-accent-subtle)",
                      color: "var(--theme-accent-hex)",
                      border: "1px solid color-mix(in srgb, var(--theme-accent-hex) 35%, transparent)",
                    }}
                  >
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Most Popular
                  </span>
                  <Badge variant="secondary" className="capitalize text-white/70 bg-white/10 border-transparent">
                    {course.type}
                  </Badge>
                </div>

                <h3 className="font-playfair text-3xl md:text-4xl font-bold text-white mb-3">
                  {course.name}
                </h3>
                <p className="text-white/65 text-base leading-relaxed mb-7 max-w-xl">
                  {course.description}
                </p>

                {course.features.length > 0 && (
                  <ul className="grid sm:grid-cols-2 gap-y-2.5 gap-x-6">
                    {course.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-white/80 text-sm">
                        <span
                          className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "color-mix(in srgb, var(--theme-accent-hex) 25%, transparent)" }}
                        >
                          <Check className="h-2.5 w-2.5" style={{ color: "var(--theme-accent-hex)" }} aria-hidden="true" />
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ── Right: price + CTA ───────────────────────── */}
              <div className="flex-shrink-0 md:text-right flex flex-col items-start md:items-end">
                <div className="mb-1 text-white/50 text-xs uppercase tracking-widest">Starting from</div>
                <div className="font-playfair text-5xl md:text-6xl font-bold text-white leading-none mb-1">
                  {formatCurrency(course.pricePence)}
                </div>
                {course.type === "hourly" && (
                  <div className="text-white/50 text-sm mb-1">/hour</div>
                )}
                {course.hoursIncluded && (
                  <div className="text-white/60 text-sm mb-7">{course.hoursIncluded} hours included</div>
                )}
                {!course.hoursIncluded && <div className="mb-7" />}
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground font-bold hover:bg-accent/90 shadow-xl px-8"
                  asChild
                >
                  <Link href="/register">Book This Package</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* ── Regular courses grid ─────────────────────────────── */}
        {regular.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regular.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: 0.3 + (featured.length ? 0.1 : 0) + i * 0.08,
                  duration: 0.55,
                  ease: "easeOut",
                }}
                className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Top accent line */}
                <div className="h-1 bg-amber/40" />

                <div className="p-6">
                  <div className="mb-4">
                    <Badge variant="secondary" className="mb-2 capitalize">{course.type}</Badge>
                    <h3 className="font-playfair text-xl font-bold text-navy">{course.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{course.description}</p>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="font-playfair text-4xl font-bold text-navy">
                        {formatCurrency(course.pricePence)}
                      </span>
                      {course.type === "hourly" && (
                        <span className="text-muted-foreground text-sm">/hr</span>
                      )}
                    </div>
                    {course.hoursIncluded && (
                      <div className="text-muted-foreground text-xs mt-0.5">{course.hoursIncluded} hrs included</div>
                    )}
                  </div>

                  {course.features.length > 0 && (
                    <ul className="space-y-2 mb-5">
                      {course.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                          <span className="text-foreground">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button variant="navy-outline" className="w-full" asChild>
                    <Link href="/register">Book Now</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Fallback: if all are featured or no regular, render all as cards */}
        {regular.length === 0 && featured.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No courses available right now. Check back soon.
          </p>
        )}
      </div>
    </section>
  );
}
