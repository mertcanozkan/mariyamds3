import { z } from "zod";

export const bookingSchema = z.object({
  studentId: z.string().uuid(),
  instructorId: z.string().uuid("Invalid instructor"),
  courseId: z.string().uuid().optional(),
  scheduledAt: z.string().min(1, "Date is required"),
  durationMinutes: z.coerce.number().int().min(30).max(480),
  locationPickup: z.string().min(5, "Pickup address is required"),
  lessonType: z.enum(["standard", "mock_test", "theory_support", "motorway"]).default("standard"),
  notes: z.string().max(500).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
