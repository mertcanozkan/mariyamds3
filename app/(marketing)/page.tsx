export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { courses, instructors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { HeroSection } from "@/components/marketing/hero";
import { WhyChooseUs } from "@/components/marketing/why-choose-us";
import { CoursesSection } from "@/components/marketing/courses-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Testimonials } from "@/components/marketing/testimonials";
import { InstructorSpotlight } from "@/components/marketing/instructor-spotlight";
import { FaqSection } from "@/components/marketing/faq-section";
import { ContactSection } from "@/components/marketing/contact-section";

export default async function HomePage() {
  const [activeCourses, activeInstructors] = await Promise.all([
    db.query.courses.findMany({
      where: eq(courses.isActive, true),
      orderBy: (c, { asc }) => [asc(c.displayOrder)],
    }),
    db.query.instructors.findMany({
      where: eq(instructors.isActive, true),
      orderBy: (i, { asc }) => [asc(i.firstName)],
    }),
  ]);

  return (
    <>
      <HeroSection />
      <WhyChooseUs />
      <CoursesSection courses={activeCourses} />
      <HowItWorks />
      <Testimonials />
      <InstructorSpotlight instructors={activeInstructors} />
      <FaqSection />
      <ContactSection />
    </>
  );
}
