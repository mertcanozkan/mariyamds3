import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Star, Users, Clock } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Mariyam Driving School",
  description: "Learn about Mariyam Driving School — professional driving instruction in London since 2010.",
};

const STATS = [
  { label: "Students Passed", value: "2,500+", icon: Users },
  { label: "First-Time Pass Rate", value: "87%", icon: Award },
  { label: "Years Experience", value: "14+", icon: Clock },
  { label: "Average Rating", value: "4.9 ★", icon: Star },
];

const VALUES = [
  {
    title: "Patience First",
    body: "We tailor every lesson to your pace. No pressure, no rushing — just steady, confident progress.",
  },
  {
    title: "Qualified Instructors",
    body: "All our instructors hold DVSA-approved ADI (Grade A) qualifications and undergo regular CPD training.",
  },
  {
    title: "Modern Fleet",
    body: "Our dual-control vehicles are serviced regularly and equipped with the latest safety technology.",
  },
  {
    title: "Flexible Scheduling",
    body: "Lessons available 7 days a week including early mornings and evenings to fit around your life.",
  },
];

export default function AboutPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto mb-20">
          <div>
            <span className="text-amber font-semibold text-sm uppercase tracking-widest">Our Story</span>
            <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-navy mt-2 leading-tight">
              Helping Londoners Drive Since 2010
            </h1>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Mariyam Driving School was founded with a simple mission: make learning to drive a positive,
              empowering experience for every student. Over 14 years, we&apos;ve helped thousands of Londoners
              earn their licence with confidence.
            </p>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Our team of DVSA-approved instructors brings patience, expertise, and genuine care to every
              lesson — whether you&apos;re a nervous first-timer or a returning learner.
            </p>
            <Button variant="amber" size="lg" className="mt-6" asChild>
              <Link href="/register">Start Learning</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <div className="w-9 h-9 rounded-lg bg-amber/10 flex items-center justify-center mb-3">
                    <Icon className="h-4 w-4 text-amber" />
                  </div>
                  <div className="text-2xl font-bold text-navy">{value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-playfair text-3xl font-bold text-navy">What We Stand For</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map(({ title, body }) => (
              <Card key={title}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-navy mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* DVSA accreditation note */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <Badge variant="secondary" className="mb-4">DVSA Approved</Badge>
          <p className="text-muted-foreground text-sm">
            All Mariyam Driving School instructors hold a current DVSA Approved Driving Instructor (ADI)
            licence. Our pass rates are consistently above the national average.
          </p>
        </div>
      </div>
    </div>
  );
}
