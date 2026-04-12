import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Mariyam Driving School",
};

export default function TermsPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-playfair text-4xl font-bold text-navy">Terms & Conditions</h1>
        <p className="text-muted-foreground mt-2">Last updated: January 2025</p>

        <div className="mt-8 space-y-8 text-muted-foreground">
          <section>
            <h2 className="font-playfair text-2xl font-semibold text-navy mb-3">1. Booking & Cancellation</h2>
            <p className="leading-relaxed">
              Lessons may be cancelled or rescheduled with at least 48 hours&apos; notice without charge.
              Cancellations within 48 hours will be charged at the full lesson rate. Repeated late cancellations
              may result in termination of the student&apos;s account.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl font-semibold text-navy mb-3">2. Payments</h2>
            <p className="leading-relaxed">
              Lessons are paid in advance via our secure online booking system. Course packages must be
              paid in full before lessons commence. Refunds for unused lessons will be processed within
              5–10 business days.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl font-semibold text-navy mb-3">3. Student Conduct</h2>
            <p className="leading-relaxed">
              Students must bring a valid provisional driving licence to every lesson. Lessons will not
              proceed if the student is under the influence of alcohol or drugs. We reserve the right to
              terminate a lesson if a student behaves in an unsafe or inappropriate manner.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl font-semibold text-navy mb-3">4. Liability</h2>
            <p className="leading-relaxed">
              All vehicles are fully insured for tuition purposes. Mariyam Driving School Ltd shall not be
              liable for any consequential loss or damage arising from the provision of driving tuition.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl font-semibold text-navy mb-3">5. Contact</h2>
            <p>
              Mariyam Driving School Ltd · Company No. 12345678<br />
              123 High Street, London E1 6RF<br />
              <a href="mailto:hello@mariyamds.co.uk" className="text-amber hover:underline">hello@mariyamds.co.uk</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
