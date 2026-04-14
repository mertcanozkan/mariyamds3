"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, Phone, Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { contactSchema, type ContactInput } from "@/lib/validations/booking";

const CONTACT_ITEMS = [
  {
    icon: MapPin,
    label: "Address",
    value: "123 High Street, London, E1 6RF",
    href: null,
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "020 7123 4567",
    href: "tel:+442071234567",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "hello@mariyamds.co.uk",
    href: "mailto:hello@mariyamds.co.uk",
  },
] as const;

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactInput) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSubmitted(true);
      reset();
    } else {
      toast({
        title: "Failed to send",
        description: "Please try again or call us directly.",
        variant: "destructive",
      });
    }
  }

  return (
    <section id="contact" className="py-24 gradient-navy noise-overlay relative overflow-hidden">

      {/* ── Background decoration ──────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full border border-white/[0.05]" />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[240px] blur-3xl opacity-15"
          style={{ background: "var(--theme-accent-hex)" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">

        {/* ── Section header ──────────────────────────────────── */}
        <div className="text-center mb-14">
          <span
            className="font-semibold text-sm uppercase tracking-[0.15em]"
            style={{ color: "var(--theme-accent-hex)" }}
          >
            Get in Touch
          </span>
          <h2 className="font-playfair text-5xl sm:text-6xl font-bold text-white mt-2">
            Contact Us
          </h2>
          <p className="text-white/55 mt-3">
            We typically respond within a few hours during business hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">

          {/* ── Contact info ─────────────────────────────────── */}
          <div className="space-y-6">
            {CONTACT_ITEMS.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-5 group">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                  style={{
                    background: "var(--theme-accent-subtle)",
                    border: "1px solid color-mix(in srgb, var(--theme-accent-hex) 25%, transparent)",
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: "var(--theme-accent-hex)" }}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-white/45 text-[11px] uppercase tracking-[0.12em] mb-1">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="text-white text-lg font-semibold transition-opacity hover:opacity-75"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-white text-lg font-semibold">{value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Map placeholder — styled to match dark section */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 h-44 flex items-center justify-center mt-2">
              <div className="text-center text-white/40 text-sm">
                <MapPin className="h-7 w-7 mx-auto mb-2 opacity-40" />
                <p>Google Maps embed</p>
                <p className="text-xs opacity-60">(Configure NEXT_PUBLIC_GOOGLE_MAPS_KEY)</p>
              </div>
            </div>
          </div>

          {/* ── Contact form — glass card ─────────────────────── */}
          <div className="glass rounded-3xl p-8">
            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--theme-accent-hex)" }} />
                <h3 className="font-playfair text-xl font-bold text-white mb-2">Message sent!</h3>
                <p className="text-white/60 text-sm">We&apos;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-sm font-semibold transition-opacity hover:opacity-75"
                  style={{ color: "var(--theme-accent-hex)" }}
                >
                  Send another →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs uppercase tracking-wider">Name</Label>
                    <input
                      placeholder="Your name"
                      suppressHydrationWarning
                      {...register("name")}
                      className="flex w-full h-10 rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent transition-colors"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs uppercase tracking-wider">Phone (optional)</Label>
                    <input
                      placeholder="07700…"
                      suppressHydrationWarning
                      {...register("phone")}
                      className="flex w-full h-10 rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Email</Label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    suppressHydrationWarning
                    {...register("email")}
                    className="flex w-full h-10 rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent transition-colors"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Subject</Label>
                  <input
                    placeholder="How can we help?"
                    suppressHydrationWarning
                    {...register("subject")}
                    className="flex w-full h-10 rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent transition-colors"
                  />
                  {errors.subject && (
                    <p className="text-red-400 text-xs">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/70 text-xs uppercase tracking-wider">Message</Label>
                  <textarea
                    {...register("message")}
                    suppressHydrationWarning
                    placeholder="Tell us more…"
                    rows={4}
                    className="flex w-full rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent resize-none transition-colors"
                  />
                  {errors.message && (
                    <p className="text-red-400 text-xs">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent text-accent-foreground font-bold hover:bg-accent/90 shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
