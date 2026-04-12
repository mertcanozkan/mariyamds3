import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Users } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses | Mariyam Driving School",
  description: "Choose from our flexible driving courses — from pay as you go to intensive packages.",
};

const COURSE_FEATURES: Record<string, string[]> = {
  hourly: ["No commitment", "Flexible scheduling", "Pay per lesson"],
  package: ["Discounted rate", "Hours bundled upfront", "Progress review included"],
  intensive: ["Pass in one week", "Full day lessons", "Mock test + theory support"],
};

export default async function CoursesPage() {
  const activeCourses = await db.query.courses.findMany({
    where: eq(courses.isActive, true),
    orderBy: (c, { asc }) => [asc(c.pricePerHourPence)],
  });

  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-amber font-semibold text-sm uppercase tracking-widest">Flexible Learning</span>
          <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-navy mt-2">
            Our Driving Courses
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Whether you&apos;re starting from scratch or need to top up your skills, we have a course that fits
            your schedule and budget.
          </p>
        </div>

        {/* Course grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {activeCourses.map((course) => {
            const features = COURSE_FEATURES[course.type] ?? [];
            return (
              <Card
                key={course.id}
                className={`relative flex flex-col ${course.isFeatured ? "border-amber shadow-lg" : ""}`}
              >
                {course.isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="amber" className="text-xs px-3 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-playfair text-xl font-bold text-navy">{course.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{course.description}</p>
                  </div>

                  <div className="mb-5">
                    {course.pricePerHourPence ? (
                      <div className="text-3xl font-bold text-navy">
                        {formatCurrency(course.pricePerHourPence)}
                        <span className="text-base font-normal text-muted-foreground">/hr</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-navy">
                        {formatCurrency(course.pricePence)}
                      </div>
                    )}
                    {course.hoursIncluded && (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        {course.hoursIncluded} hours included
                      </div>
                    )}
                  </div>

                  {features.length > 0 && (
                    <ul className="space-y-2 mb-6 flex-1">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-amber flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button variant={course.isFeatured ? "amber" : "navy-outline"} className="w-full mt-auto" asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <Users className="h-4 w-4" />
            Not sure which course is right for you?
          </div>
          <div>
            <Button variant="amber" size="lg" asChild>
              <Link href="/contact">Talk to Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
