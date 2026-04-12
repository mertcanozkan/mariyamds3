import { ContactSection } from "@/components/marketing/contact-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Mariyam Driving School",
  description: "Get in touch with Mariyam Driving School — we respond within a few hours during business hours.",
};

export default function ContactPage() {
  return (
    <div className="pt-8">
      <ContactSection />
    </div>
  );
}
