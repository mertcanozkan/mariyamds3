import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PoundSterling,
  Calendar,
  TrendingUp,
  Users,
  ShieldCheck,
  Headphones,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work With Us | Mariyam Driving School",
  description:
    "Join Mariyam Driving School as an approved driving instructor. Competitive earnings, full admin support, and a growing student base across London.",
};

const BENEFITS = [
  {
    icon: PoundSterling,
    title: "Competitive Earnings",
    body: "Keep the majority of every lesson fee. Transparent pay structure with no hidden deductions — you know exactly what you earn.",
  },
  {
    icon: Calendar,
    title: "Full Schedule Flexibility",
    body: "Set your own working days, hours, and areas. Take on as many or as few students as suits your lifestyle.",
  },
  {
    icon: Users,
    title: "Ready-Made Student Base",
    body: "We handle all the marketing and student acquisition. You focus on teaching — we keep your diary full.",
  },
  {
    icon: Headphones,
    title: "Dedicated Admin Support",
    body: "Our team manages bookings, cancellations, payments, and communications so you can concentrate on the road.",
  },
  {
    icon: TrendingUp,
    title: "Digital Tools & Dashboard",
    body: "Access your schedule, student progress, and lesson history through our modern instructor portal — no paperwork.",
  },
  {
    icon: ShieldCheck,
    title: "Professional Community",
    body: "Join a team of DVSA-approved instructors with shared CPD resources, peer support, and regular team meet-ups.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Apply online",
    body: "Complete our short application form with your details and DVSA ADI number. Takes under 5 minutes.",
  },
  {
    number: "02",
    title: "We verify your credentials",
    body: "Our team checks your ADI registration and has a brief call to understand what you're looking for.",
  },
  {
    number: "03",
    title: "Get activated",
    body: "Once approved, your account goes live and students in your area can start booking with you immediately.",
  },
];

const REQUIREMENTS = [
  "DVSA-approved ADI licence (Grade A or B)",
  "Valid UK driving licence",
  "DBS (Disclosure and Barring Service) check",
  "Your own dual-control tuition vehicle",
  "Business insurance that covers tuition use",
  "Eligibility to work in the UK",
];

const TESTIMONIALS = [
  {
    name: "David Okafor",
    tenure: "Instructor since 2022",
    quote:
      "Joining Mariyam Driving School was the best decision I made. My diary has been consistently full from the first month and the admin team handles everything I hate about running my own business.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    tenure: "Instructor since 2021",
    quote:
      "The flexibility is unmatched. I work four days a week, school hours only, and still earn more than I did at my previous driving school. The platform makes everything so straightforward.",
    rating: 5,
  },
  {
    name: "Tariq Hassan",
    tenure: "Instructor since 2023",
    quote:
      "What I love most is the student quality. Learners come in motivated and well-prepared because of how the school sets expectations upfront. Lessons are genuinely enjoyable.",
    rating: 5,
  },
];

export default function WorkWithUsPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">

        {/* ── Hero ── */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <Badge variant="amber" className="mb-4">Now recruiting instructors</Badge>
          <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-navy leading-tight">
            Build your career with<br className="hidden sm:block" /> Mariyam Driving School
          </h1>
          <p className="text-muted-foreground mt-5 text-lg leading-relaxed max-w-2xl mx-auto">
            We&apos;re always looking for passionate, DVSA-approved instructors to join our growing team
            across London. Competitive earnings, full admin support, and students who are ready to learn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button variant="amber" size="lg" asChild>
              <Link href="/register/instructor">
                Apply Now <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20 max-w-4xl mx-auto">
          {[
            { value: "2,500+", label: "Students taught" },
            { value: "87%",    label: "First-time pass rate" },
            { value: "4.9 ★",  label: "Average instructor rating" },
            { value: "14+",    label: "Years in London" },
          ].map((s) => (
            <div key={s.label} className="bg-navy rounded-2xl p-5 text-center">
              <div className="font-playfair text-2xl font-bold text-amber">{s.value}</div>
              <div className="text-white/70 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Benefits ── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-amber font-semibold text-sm uppercase tracking-widest">Why join us</span>
            <h2 className="font-playfair text-3xl font-bold text-navy mt-2">Everything you need to succeed</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {BENEFITS.map((b) => (
              <Card key={b.title} className="hover:border-amber/40 transition-colors">
                <CardContent className="p-6">
                  <div className="w-11 h-11 rounded-xl bg-amber/10 flex items-center justify-center mb-4">
                    <b.icon className="h-5 w-5 text-amber" />
                  </div>
                  <h3 className="font-semibold text-navy mb-2">{b.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{b.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="mb-20 bg-navy/3 rounded-3xl p-8 lg:p-12 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-amber font-semibold text-sm uppercase tracking-widest">The process</span>
            <h2 className="font-playfair text-3xl font-bold text-navy mt-2">Up and running in days, not weeks</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.number} className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber/10 border-2 border-amber/20 flex items-center justify-center mx-auto mb-4">
                  <span className="font-playfair font-bold text-amber text-sm">{s.number}</span>
                </div>
                <h3 className="font-semibold text-navy mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Requirements ── */}
        <div className="mb-20 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-amber font-semibold text-sm uppercase tracking-widest">Requirements</span>
            <h2 className="font-playfair text-3xl font-bold text-navy mt-2">What you&apos;ll need</h2>
            <p className="text-muted-foreground mt-3 text-sm">
              We maintain high standards to protect our students. Here&apos;s what we ask of every instructor.
            </p>
          </div>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {REQUIREMENTS.map((req) => (
                  <li key={req} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-amber flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Not quite there yet? <Link href="/contact" className="text-navy hover:underline">Get in touch</Link> and we&apos;ll help you figure out next steps.
          </p>
        </div>

        {/* ── Testimonials ── */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-amber font-semibold text-sm uppercase tracking-widest">From our instructors</span>
            <h2 className="font-playfair text-3xl font-bold text-navy mt-2">Hear it from the team</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="hover:border-amber/40 transition-colors">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber text-amber" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-auto">
                    <div className="font-semibold text-navy text-sm">{t.name}</div>
                    <div className="text-muted-foreground text-xs">{t.tenure}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="max-w-2xl mx-auto text-center bg-navy rounded-3xl p-10 lg:p-14">
          <h2 className="font-playfair text-3xl font-bold text-white mb-3">Ready to join the team?</h2>
          <p className="text-white/70 text-sm mb-8 leading-relaxed">
            Apply online in minutes. Our team reviews every application personally and you&apos;ll hear back within 1–2 business days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="amber" size="lg" asChild>
              <Link href="/register/instructor">
                Apply Now <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="border border-white/30 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/contact">Ask a Question</Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
