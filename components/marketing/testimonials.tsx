"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TESTIMONIALS = [
  { name: "Sophie Clarke",   area: "Hackney",    rating: 5, text: "Passed first time after just 20 hours with James. He was incredibly patient and his knowledge of East London roads is unmatched. Highly recommend the 20-hour package." },
  { name: "Marcus Thompson", area: "Islington",  rating: 5, text: "Priya is an absolute gem of an instructor. I was a nervous wreck at the start but she built my confidence lesson by lesson. Got my licence on the first attempt!" },
  { name: "Aisha Patel",     area: "Southwark",  rating: 5, text: "The online booking system is so easy. I loved being able to track my progress on the dashboard. Daniel's feedback after each lesson was really constructive." },
  { name: "Liam O'Brien",    area: "Westminster", rating: 4, text: "Did the 5-day intensive course before my holiday — passed on day 5! The pace is full-on but completely worth it. Great instructors throughout." },
  { name: "Fatima Hassan",   area: "Camden",     rating: 5, text: "As a mature learner I was worried about being judged. Priya was incredibly professional and adapted her teaching style perfectly to how I learn. Couldn't recommend more." },
] as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-amber text-amber" : "text-muted-foreground/30"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function MarqueeChip({ t }: { t: typeof TESTIMONIALS[number] }) {
  return (
    <span className="inline-flex items-center gap-3 bg-white border border-border rounded-full px-4 py-2.5 flex-shrink-0 shadow-sm">
      {/* Avatar */}
      <span className="w-6 h-6 rounded-full bg-amber/20 flex items-center justify-center text-amber font-bold text-[10px] flex-shrink-0">
        {t.name[0]}
      </span>
      {/* Stars */}
      <span className="flex gap-0.5">
        {Array.from({ length: t.rating }).map((_, j) => (
          <Star key={j} className="h-3 w-3 fill-amber text-amber" aria-hidden="true" />
        ))}
      </span>
      <span className="text-navy font-semibold text-sm whitespace-nowrap">{t.name}</span>
      <span className="text-muted-foreground text-xs whitespace-nowrap">{t.area}</span>
    </span>
  );
}

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? TESTIMONIALS.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === TESTIMONIALS.length - 1 ? 0 : c + 1));

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">

        {/* ── Section header ──────────────────────────────────── */}
        <div className="text-center mb-14">
          <span className="text-amber font-semibold text-sm uppercase tracking-[0.15em]">Testimonials</span>
          <h2 className="font-playfair text-5xl sm:text-6xl font-bold text-navy mt-2">
            What Our Students Say
          </h2>
        </div>

        {/* ── Featured testimonial ────────────────────────────── */}
        <div className="max-w-3xl mx-auto mb-14">
          <div className="relative rounded-3xl bg-slate-50 border border-border p-8 md:p-14 overflow-hidden">

            {/* Giant decorative quotation mark */}
            <div
              className="absolute -top-2 left-6 font-playfair font-bold text-[9rem] leading-none select-none pointer-events-none"
              style={{ color: "var(--theme-accent-hex)", opacity: 0.12 }}
              aria-hidden="true"
            >
              &ldquo;
            </div>

            {/* Accent glow corner */}
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"
              style={{ background: "var(--theme-accent-hex)" }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
              >
                <StarRating rating={TESTIMONIALS[current].rating} />

                <blockquote className="font-playfair text-xl md:text-2xl text-navy leading-relaxed mt-6 mb-8 italic">
                  &ldquo;{TESTIMONIALS[current].text}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  {/* Avatar circle */}
                  <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center font-bold text-amber text-sm flex-shrink-0">
                    {TESTIMONIALS[current].name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-navy text-sm">{TESTIMONIALS[current].name}</div>
                    <div className="text-muted-foreground text-xs">{TESTIMONIALS[current].area}, London</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots + nav */}
          <div className="flex items-center justify-between mt-5 px-1">
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="transition-all duration-200"
                  aria-label={`Go to testimonial ${i + 1}`}
                >
                  <span
                    className="block rounded-full transition-all duration-200"
                    style={{
                      width: i === current ? "20px" : "8px",
                      height: "8px",
                      background: i === current ? "var(--theme-accent-hex)" : "hsl(var(--muted-foreground) / 0.3)",
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-border hover:border-amber hover:text-amber flex items-center justify-center transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-border hover:border-amber hover:text-amber flex items-center justify-center transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Marquee ticker — full viewport width ────────────────── */}
      <div className="relative overflow-hidden py-3 pause-marquee" aria-hidden="true">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* The marquee track — content duplicated for seamless loop */}
        <div className="inner-marquee flex gap-4 animate-marquee w-max">
          {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <MarqueeChip key={`${t.name}-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
