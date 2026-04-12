import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only expose presence, never values
  const checks: Record<string, boolean> = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    AUTH_SECRET: !!(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
    AUTH_GOOGLE: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder"),
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.includes("placeholder"),
    RESEND_API_KEY: !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("placeholder"),
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
  };

  return NextResponse.json({ checks });
}
