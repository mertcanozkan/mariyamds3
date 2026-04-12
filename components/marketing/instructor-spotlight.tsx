"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Award } from "lucide-react";

type Instructor = {
  id: string;
  firstName: string;
  lastName: string;
  dvsaAdiNumber: string;
  bio: string | null;
  specialisations: string[];
  photoUrl: string | null;
};

interface Props {
  instructors: Instructor[];
}

export function InstructorSpotlight({ instructors }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  if (instructors.length === 0) return null;

  return (
    <section ref={ref} className="py-24 bg-slate-50/70">
      <div className="container mx-auto px-4">

        {/* ── Section header ──────────────────────────────────── */}
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-amber font-semibold text-sm uppercase tracking-[0.15em]"
          >
            Our Team
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.09 }}
            className="font-playfair text-5xl sm:text-6xl font-bold text-navy mt-2"
          >
            Meet Your Instructors
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-muted-foreground mt-3 max-w-lg mx-auto"
          >
            All fully qualified, DVSA-approved, and passionate about helping you succeed.
          </motion.p>
        </div>

        {/* ── Instructor cards ─────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor, i) => {
            const initials = `${instructor.firstName[0]}${instructor.lastName[0]}`;
            return (
              <motion.div
                key={instructor.id}
                initial={{ opacity: 0, y: 28 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* ── Card header — theme gradient ────────────── */}
                <div className="h-52 relative overflow-hidden gradient-navy noise-overlay flex items-center justify-center">

                  {/* Very large initials as watermark */}
                  <span
                    className="absolute font-playfair font-bold text-white/[0.07] select-none pointer-events-none leading-none"
                    style={{ fontSize: "clamp(5rem, 14vw, 9rem)" }}
                    aria-hidden="true"
                  >
                    {initials}
                  </span>

                  {/* Accent glow */}
                  <div
                    className="absolute bottom-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-25"
                    style={{ background: "var(--theme-accent-hex)" }}
                    aria-hidden="true"
                  />

                  {/* Avatar circle — photo if available, else initials */}
                  <div className="relative z-10 w-[4.5rem] h-[4.5rem] rounded-full bg-white/15 border-2 border-white/25 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
                    {instructor.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={instructor.photoUrl}
                        alt={`${instructor.firstName} ${instructor.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-playfair text-2xl font-bold text-white">
                        {initials}
                      </span>
                    )}
                  </div>

                  {/* ADI badge */}
                  <div className="absolute bottom-4 right-4 glass rounded-full px-3 py-1.5 flex items-center gap-1.5 z-20">
                    <Award className="h-3.5 w-3.5" style={{ color: "var(--theme-accent-hex)" }} aria-hidden="true" />
                    <span className="text-white text-xs font-mono tracking-wide">{instructor.dvsaAdiNumber}</span>
                  </div>
                </div>

                {/* ── Card body ───────────────────────────────── */}
                <div className="p-6">
                  <h3 className="font-playfair font-bold text-navy text-xl mb-0.5">
                    {instructor.firstName} {instructor.lastName}
                  </h3>
                  {instructor.bio && (
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed mb-4">
                      {instructor.bio}
                    </p>
                  )}
                  {instructor.specialisations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {instructor.specialisations.map((s) => (
                        <span
                          key={s}
                          className="inline-block text-xs font-medium px-2.5 py-1 rounded-full border capitalize"
                          style={{
                            background: "var(--theme-accent-subtle)",
                            color: "hsl(var(--accent))",
                            borderColor: "color-mix(in srgb, var(--theme-accent-hex) 30%, transparent)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
