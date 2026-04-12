import { db } from "./index";
import type { InferSelectModel } from "drizzle-orm";
import {
  users,
  studentProfiles,
  instructors,
  courses,
  bookings,
  payments,
  lessonProgress,
} from "./schema";
import bcrypt from "bcryptjs";

type StudentProfile = InferSelectModel<typeof studentProfiles>;

async function seed() {
  console.log("🌱 Seeding database...");

  // ─── Admin ──────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("M@r1yamDS", 12);
  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@mariyamds.co.uk",
      passwordHash: adminHash,
      role: "admin",
    })
    .returning();
  console.log("✅ Admin user created");

  // ─── Instructors ─────────────────────────────────────────────────────────
  const instructorData = [
    {
      email: "james.wilson@mariyamds.co.uk",
      firstName: "James",
      lastName: "Wilson",
      phone: "07700900001",
      dvsaAdiNumber: "ADI-6142891",
      bio: "Experienced DVSA-approved instructor with 12 years on London roads. Specialises in nervous learners and intensive courses.",
      specialisations: ["nervous learners", "intensive courses", "manual"],
    },
    {
      email: "priya.sharma@mariyamds.co.uk",
      firstName: "Priya",
      lastName: "Sharma",
      phone: "07700900002",
      dvsaAdiNumber: "ADI-7382940",
      bio: "Patient and encouraging instructor with a 94% first-time pass rate. Expert in automatic and manual transmissions.",
      specialisations: ["automatic", "mature learners", "test preparation"],
    },
    {
      email: "daniel.okafor@mariyamds.co.uk",
      firstName: "Daniel",
      lastName: "Okafor",
      phone: "07700900003",
      dvsaAdiNumber: "ADI-8291047",
      bio: "Former advanced driving examiner turned instructor. Covers North and East London with flexible scheduling.",
      specialisations: ["motorway", "pass plus", "fleet drivers"],
    },
  ];

  const instructorHash = await bcrypt.hash("Instructor1234!", 12);
  const createdInstructors = [];

  for (const data of instructorData) {
    const [user] = await db
      .insert(users)
      .values({ email: data.email, passwordHash: instructorHash, role: "instructor" })
      .returning();

    const [instructor] = await db
      .insert(instructors)
      .values({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dvsaAdiNumber: data.dvsaAdiNumber,
        bio: data.bio,
        specialisations: data.specialisations,
        workingDays: [1, 2, 3, 4, 5, 6],
        availableFrom: "08:00",
        availableTo: "19:00",
      })
      .returning();

    createdInstructors.push(instructor);
  }
  console.log("✅ Instructors created");

  // ─── Courses ─────────────────────────────────────────────────────────────
  const courseData = [
    {
      name: "Pay As You Go",
      slug: "pay-as-you-go",
      description: "Flexible hourly lessons with no commitment. Perfect for refreshers or topping up existing skills.",
      type: "hourly" as const,
      pricePence: 3500,
      pricePerHourPence: 3500,
      features: ["No upfront commitment", "Flexible scheduling", "Any certified instructor", "Reschedule 48hrs notice"],
      displayOrder: 1,
    },
    {
      name: "10-Hour Starter Package",
      slug: "10-hour-starter",
      description: "Ideal for absolute beginners. Get a solid foundation with 10 structured lessons.",
      type: "package" as const,
      hoursIncluded: 10,
      pricePence: 32000,
      features: ["Save £30 vs hourly", "Dedicated instructor", "Theory test guidance", "Progress tracking"],
      displayOrder: 2,
    },
    {
      name: "20-Hour Standard Package",
      slug: "20-hour-standard",
      description: "Our most popular package. Comprehensive preparation from basics to test-ready.",
      type: "package" as const,
      hoursIncluded: 20,
      pricePence: 60000,
      features: ["Save £100 vs hourly", "Dedicated instructor", "Mock test included", "Theory support", "Progress dashboard"],
      isFeatured: true,
      displayOrder: 3,
    },
    {
      name: "30-Hour Complete Package",
      slug: "30-hour-complete",
      description: "The complete learner journey. Everything you need to pass with confidence.",
      type: "package" as const,
      hoursIncluded: 30,
      pricePence: 84000,
      features: ["Save £165 vs hourly", "Priority booking", "2 mock tests", "Theory test support", "Pass guarantee conditions apply"],
      displayOrder: 4,
    },
    {
      name: "5-Day Intensive Course",
      slug: "5-day-intensive",
      description: "Pass in a week. Intensive daily lessons plus a test booking at the end of the week.",
      type: "intensive" as const,
      hoursIncluded: 30,
      pricePence: 75000,
      features: ["6 hours/day", "Test booking included", "Dedicated instructor", "Theory crash course", "Ideal for holidays/job requirements"],
      displayOrder: 5,
    },
  ];

  await db.insert(courses).values(courseData);
  const allCourses = await db.query.courses.findMany({ orderBy: (c, { asc }) => [asc(c.displayOrder)] });
  console.log("✅ Courses created");

  // ─── Students ────────────────────────────────────────────────────────────
  const studentData = [
    { firstName: "Sophie", lastName: "Clarke", email: "sophie.clarke@email.com", postcode: "E1 6RF", city: "London" },
    { firstName: "Marcus", lastName: "Thompson", email: "marcus.thompson@email.com", postcode: "N1 9GU", city: "London" },
    { firstName: "Aisha", lastName: "Patel", email: "aisha.patel@email.com", postcode: "SE1 7PB", city: "London" },
    { firstName: "Liam", lastName: "O'Brien", email: "liam.obrien@email.com", postcode: "W1T 4JD", city: "London" },
    { firstName: "Fatima", lastName: "Hassan", email: "fatima.hassan@email.com", postcode: "NW3 5TH", city: "London" },
    { firstName: "Jack", lastName: "Morrison", email: "jack.morrison@email.com", postcode: "SW9 8RG", city: "London" },
    { firstName: "Elena", lastName: "Novak", email: "elena.novak@email.com", postcode: "EC2A 4PQ", city: "London" },
    { firstName: "Tariq", lastName: "Ahmed", email: "tariq.ahmed@email.com", postcode: "E14 5HP", city: "London" },
    { firstName: "Charlotte", lastName: "Davies", email: "charlotte.davies@email.com", postcode: "W6 9HX", city: "London" },
    { firstName: "Ravi", lastName: "Gupta", email: "ravi.gupta@email.com", postcode: "N7 6LA", city: "London" },
  ];

  const studentHash = await bcrypt.hash("Student1234!", 12);
  const createdStudents = [];

  for (const data of studentData) {
    const [user] = await db
      .insert(users)
      .values({ email: data.email, passwordHash: studentHash, role: "student" })
      .returning();

    const [profile]: StudentProfile[] = await db
      .insert(studentProfiles)
      .values({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: `0770090${String(createdStudents.length + 10).padStart(4, "0")}`,
        addressLine1: `${Math.floor(Math.random() * 200) + 1} Example Street`,
        city: data.city,
        postcode: data.postcode,
      })
      .returning();

    createdStudents.push(profile);
  }
  console.log("✅ Students created");

  // ─── Bookings & Payments ─────────────────────────────────────────────────
  const statuses = ["completed", "completed", "completed", "confirmed", "pending", "cancelled"] as const;
  const lessonTypes = ["standard", "standard", "standard", "mock_test", "theory_support"] as const;

  let bookingCount = 0;

  for (let i = 0; i < 30; i++) {
    const student = createdStudents[i % createdStudents.length];
    const instructor = createdInstructors[i % createdInstructors.length];
    const status = statuses[i % statuses.length];
    const lessonType = lessonTypes[i % lessonTypes.length];

    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() - 30 + i * 3);

    const [booking] = await db
      .insert(bookings)
      .values({
        studentId: student.id,
        instructorId: instructor.id,
        courseId: allCourses[i % allCourses.length].id,
        scheduledAt,
        durationMinutes: [60, 90, 120][i % 3],
        locationPickup: `${student.addressLine1}, ${student.postcode}`,
        status,
        lessonType,
      })
      .returning();

    bookingCount++;

    if (status !== "cancelled") {
      const amount = 3500 * ([60, 90, 120][i % 3] / 60);
      await db.insert(payments).values({
        studentId: student.id,
        bookingId: booking.id,
        amountPence: amount,
        status: status === "completed" || status === "confirmed" ? "paid" : "pending",
        description: `Driving lesson - ${new Date(scheduledAt).toLocaleDateString("en-GB")}`,
        paidAt: status === "completed" ? new Date(scheduledAt.getTime() - 86400000) : null,
      });
    }

    if (status === "completed") {
      const competencyKeys = [
        "controls_signals",
        "moving_off_stopping",
        "junctions_roundabouts",
        "town_dual_carriageway",
        "hazard_awareness",
        "manoeuvres",
        "independent_driving",
      ];
      const competencies: Record<string, number> = {};
      for (const key of competencyKeys) {
        competencies[key] = Math.floor(Math.random() * 3) + 3; // 3-5
      }

      await db.insert(lessonProgress).values({
        bookingId: booking.id,
        studentId: student.id,
        instructorId: instructor.id,
        overallRating: Math.floor(Math.random() * 2) + 4,
        competencies,
        feedback: "Good progress this lesson. Keep practicing junction approaches.",
        hoursLogged: String([1, 1.5, 2][i % 3]),
      });
    }
  }

  console.log(`✅ ${bookingCount} bookings and associated payments created`);
  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
