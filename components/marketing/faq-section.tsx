"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";

const FAQS = [
  { q: "Do I need a provisional driving licence before booking?", a: "Yes, you must hold a valid provisional driving licence before taking lessons. You can apply online via the DVLA for £34. We'll ask for your licence number during registration." },
  { q: "What's the difference between automatic and manual lessons?", a: "Manual lessons teach you to drive a car with a clutch and gearbox. Automatic lessons are easier to start but your licence will only allow you to drive automatics. We offer both — just let us know your preference when booking." },
  { q: "What is your cancellation policy?", a: "You can cancel or reschedule any lesson without charge as long as you give at least 48 hours' notice. Cancellations within 48 hours are non-refundable." },
  { q: "How many lessons will I need to pass?", a: "The DVSA recommends around 45 hours of professional instruction plus 22 hours of private practice. This varies depending on individual ability — our instructors will give you an honest assessment." },
  { q: "Are your instructors fully qualified?", a: "All our instructors hold full DVSA Approved Driving Instructor (ADI) qualifications and undergo regular check tests. Trainee instructors (PDIs) are never used without full disclosure." },
  { q: "Can I book lessons for just the theory test?", a: "Yes — we offer Theory Support lessons. Your instructor will help you revise the Highway Code, hazard perception, and the show-me/tell-me questions." },
  { q: "Do you offer lessons for nervous drivers?", a: "Absolutely. Several of our instructors specialise in working with nervous learners. They're trained to use a calm, patient approach and will never rush you." },
  { q: "Which areas of London do you cover?", a: "We cover most London postcodes including all zones from Central through to the outer boroughs. Enter your postcode when registering and we'll match you with a nearby instructor." },
  { q: "What happens if I fail my driving test?", a: "Don't worry — it happens to many learners. We'll review your feedback from the examiner and focus additional lessons on the areas that need work. Rebooking your test is straightforward." },
  { q: "Is there a minimum age requirement?", a: "You can start lessons from age 17 for a car licence. We recommend booking a few months in advance of your 17th birthday so you're ready to take your test as soon as you're eligible." },
] as const;

interface FaqItemProps {
  index: number;
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqItem({ index, q, a, isOpen, onToggle }: FaqItemProps) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between py-5 text-left gap-4 group"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-4 flex-1">
          {/* Large accent number */}
          <span
            className="font-playfair font-bold text-2xl leading-none mt-0.5 flex-shrink-0 w-8 transition-colors duration-200"
            style={{
              color: isOpen ? "var(--theme-accent-hex)" : "hsl(var(--muted-foreground) / 0.35)",
            }}
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="font-medium text-base leading-snug pt-0.5 transition-colors duration-200"
            style={{ color: isOpen ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}
          >
            {q}
          </span>
        </div>
        <ChevronDown
          className="h-5 w-5 flex-shrink-0 mt-0.5 transition-all duration-300"
          style={{
            color: "var(--theme-accent-hex)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 pl-12 text-muted-foreground leading-relaxed text-sm">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-[360px,1fr] gap-16 max-w-5xl mx-auto">

          {/* ── Left: sticky header ──────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="text-amber font-semibold text-sm uppercase tracking-[0.15em]">
              FAQ
            </span>
            <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-navy mt-2 leading-tight">
              Common<br />Questions
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed text-sm">
              Everything you need to know before booking your first lesson with us.
            </p>

            {/* CTA card */}
            <div
              className="mt-8 p-6 rounded-2xl border"
              style={{
                background: "var(--theme-accent-subtle)",
                borderColor: "color-mix(in srgb, var(--theme-accent-hex) 25%, transparent)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "color-mix(in srgb, var(--theme-accent-hex) 20%, transparent)" }}
              >
                <MessageCircle className="h-5 w-5" style={{ color: "var(--theme-accent-hex)" }} />
              </div>
              <p className="font-semibold text-navy text-sm mb-1">Still have questions?</p>
              <p className="text-muted-foreground text-xs mb-3 leading-relaxed">
                Our team typically responds within 2 hours during business hours.
              </p>
              <a
                href="#contact"
                className="font-semibold text-sm transition-opacity hover:opacity-80"
                style={{ color: "var(--theme-accent-hex)" }}
              >
                Contact us →
              </a>
            </div>
          </div>

          {/* ── Right: accordion list ─────────────────────────── */}
          <div>
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i}
                index={i}
                q={faq.q}
                a={faq.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
