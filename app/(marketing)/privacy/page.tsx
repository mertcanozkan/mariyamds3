import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Mariyam Driving School",
};

export default function PrivacyPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-3xl prose prose-slate">
        <h1 className="font-playfair text-4xl font-bold text-navy">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: January 2025</p>

        <h2 className="font-playfair text-2xl font-semibold text-navy mt-8 mb-3">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          Mariyam Driving School Ltd (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your personal data.
          This privacy policy explains how we collect, use, and protect your information when you use our website and services.
        </p>

        <h2 className="font-playfair text-2xl font-semibold text-navy mt-8 mb-3">2. Data We Collect</h2>
        <ul className="text-muted-foreground space-y-2">
          <li>Name, email address, phone number, and home address</li>
          <li>Driving licence number and test dates</li>
          <li>Payment information (processed securely via Stripe)</li>
          <li>Lesson progress and instructor notes</li>
          <li>Emergency contact information</li>
        </ul>

        <h2 className="font-playfair text-2xl font-semibold text-navy mt-8 mb-3">3. How We Use Your Data</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use your data to provide driving instruction services, process payments, send booking confirmations, and communicate
          progress with your instructor. We do not sell your data to third parties.
        </p>

        <h2 className="font-playfair text-2xl font-semibold text-navy mt-8 mb-3">4. Contact Us</h2>
        <p className="text-muted-foreground">
          For data requests or queries, contact us at{" "}
          <a href="mailto:hello@mariyamds.co.uk" className="text-amber hover:underline">
            hello@mariyamds.co.uk
          </a>
        </p>
      </div>
    </div>
  );
}
