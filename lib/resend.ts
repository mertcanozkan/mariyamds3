import { Resend } from "resend";

export const FROM_EMAIL = process.env.EMAIL_FROM ?? "noreply@mariyamds.co.uk";
export const SCHOOL_NAME = "Mariyam Driving School";

// Falls back to a dummy key so imports don't throw during Next.js build.
// Actual API calls will fail at runtime if RESEND_API_KEY is not set.
export const resend = new Resend(process.env.RESEND_API_KEY ?? "re_build_placeholder");
