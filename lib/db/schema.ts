import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  date,
  time,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "instructor",
  "admin",
]);

export const courseTypeEnum = pgEnum("course_type", [
  "hourly",
  "package",
  "intensive",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);

export const lessonTypeEnum = pgEnum("lesson_type", [
  "standard",
  "mock_test",
  "theory_support",
  "motorway",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("student"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// NextAuth required tables
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  // OAuth token fields — property names must be snake_case for @auth/drizzle-adapter
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: date("date_of_birth"),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  postcode: text("postcode").notNull(),
  provisionalLicenceNumber: text("provisional_licence_number"),
  provisionalLicenceVerified: boolean("provisional_licence_verified")
    .notNull()
    .default(false),
  provisionalLicencePhotoUrl: text("provisional_licence_photo_url"),
  profilePhotoUrl: text("profile_photo_url"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  hasPreviousLessons: boolean("has_previous_lessons").notNull().default(false),
  previousLessonsHours: integer("previous_lessons_hours").default(0),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const instructors = pgTable("instructors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  dvsaAdiNumber: text("dvsa_adi_number").notNull().unique(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  specialisations: text("specialisations").array().notNull().default([]),
  availableFrom: time("available_from").notNull().default("08:00"),
  availableTo: time("available_to").notNull().default("18:00"),
  workingDays: integer("working_days").array().notNull().default([1, 2, 3, 4, 5]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  type: courseTypeEnum("type").notNull(),
  hoursIncluded: integer("hours_included"),
  pricePence: integer("price_pence").notNull(),
  pricePerHourPence: integer("price_per_hour_pence"),
  features: text("features").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  instructorId: uuid("instructor_id")
    .notNull()
    .references(() => instructors.id),
  courseId: uuid("course_id").references(() => courses.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  locationPickup: text("location_pickup").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  lessonType: lessonTypeEnum("lesson_type").notNull().default("standard"),
  instructorNotes: text("instructor_notes"),
  studentNotes: text("student_notes"),
  cancellationReason: text("cancellation_reason"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id").references(() => bookings.id),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
  amountPence: integer("amount_pence").notNull(),
  currency: text("currency").notNull().default("gbp"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  description: text("description").notNull(),
  paidAt: timestamp("paid_at"),
  refundedAt: timestamp("refunded_at"),
  refundAmountPence: integer("refund_amount_pence").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  instructorId: uuid("instructor_id")
    .notNull()
    .references(() => instructors.id),
  overallRating: integer("overall_rating").notNull().default(3),
  competencies: jsonb("competencies").$type<Record<string, number>>().notNull().default({}),
  feedback: text("feedback").notNull().default(""),
  hoursLogged: numeric("hours_logged", { precision: 4, scale: 2 }).notNull().default("1.00"),
  nextLessonGoals: text("next_lesson_goals"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const availabilityBlocks = pgTable("availability_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  instructorId: uuid("instructor_id")
    .notNull()
    .references(() => instructors.id, { onDelete: "cascade" }),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  instructor: one(instructors, {
    fields: [users.id],
    references: [instructors.userId],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  passwordResetTokens: many(passwordResetTokens),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
  payments: many(payments),
  lessonProgress: many(lessonProgress),
}));

export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  user: one(users, {
    fields: [instructors.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
  lessonProgress: many(lessonProgress),
  availabilityBlocks: many(availabilityBlocks),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  student: one(studentProfiles, {
    fields: [bookings.studentId],
    references: [studentProfiles.id],
  }),
  instructor: one(instructors, {
    fields: [bookings.instructorId],
    references: [instructors.id],
  }),
  course: one(courses, {
    fields: [bookings.courseId],
    references: [courses.id],
  }),
  payment: one(payments, {
    fields: [bookings.id],
    references: [payments.bookingId],
  }),
  progress: one(lessonProgress, {
    fields: [bookings.id],
    references: [lessonProgress.bookingId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(studentProfiles, {
    fields: [payments.studentId],
    references: [studentProfiles.id],
  }),
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  booking: one(bookings, {
    fields: [lessonProgress.bookingId],
    references: [bookings.id],
  }),
  student: one(studentProfiles, {
    fields: [lessonProgress.studentId],
    references: [studentProfiles.id],
  }),
  instructor: one(instructors, {
    fields: [lessonProgress.instructorId],
    references: [instructors.id],
  }),
}));

// ─── School Settings ─────────────────────────────────────────────────────────

export const schoolSettings = pgTable("school_settings", {
  id: integer("id").primaryKey().default(1), // singleton row — always id=1
  schoolName: text("school_name").notNull().default("Mariyam Driving School"),
  tagline: text("tagline"),
  contactEmail: text("contact_email").notNull().default("hello@mariyamds.co.uk"),
  phone: text("phone").notNull().default("020 7123 4567"),
  addressLine1: text("address_line1").notNull().default(""),
  addressLine2: text("address_line2"),
  city: text("city").notNull().default("London"),
  postcode: text("postcode").notNull().default(""),
  websiteUrl: text("website_url"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SchoolSettings = typeof schoolSettings.$inferSelect;

// ─── Promotions ───────────────────────────────────────────────────────────────

export const promotions = pgTable("promotions", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  discountType: text("discount_type").notNull().default("percentage"), // 'percentage' | 'fixed'
  discountValue: integer("discount_value").notNull(), // percentage 0-100 or pence
  minOrderPence: integer("min_order_pence").default(0).notNull(),
  maxUsages: integer("max_usages"), // null = unlimited
  usageCount: integer("usage_count").default(0).notNull(),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type NewStudentProfile = typeof studentProfiles.$inferInsert;
export type Instructor = typeof instructors.$inferSelect;
export type NewInstructor = typeof instructors.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
export type NewPromotion = typeof promotions.$inferInsert;
export type AvailabilityBlock = typeof availabilityBlocks.$inferSelect;
