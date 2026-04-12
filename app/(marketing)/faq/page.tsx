import { FaqSection } from "@/components/marketing/faq-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Mariyam Driving School",
  description: "Answers to common questions about lessons, pricing, and booking.",
};

export default function FaqPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-amber font-semibold text-sm uppercase tracking-widest">Help Centre</span>
          <h1 className="font-playfair text-4xl font-bold text-navy mt-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mt-3">
            Can&apos;t find your answer? <a href="/contact" className="text-amber hover:underline">Contact us</a> and we&apos;ll get back to you within a few hours.
          </p>
        </div>
        <FaqSection />
      </div>
    </div>
  );
}
