import Stripe from "stripe";

// Falls back to a dummy key so imports don't throw during Next.js build.
// Actual API calls will fail at runtime if STRIPE_SECRET_KEY is not set.
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_build_placeholder",
  { apiVersion: "2025-02-24.acacia", typescript: true }
);

export function formatPence(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}
