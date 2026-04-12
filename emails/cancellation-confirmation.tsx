import {
  Body, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from "@react-email/components";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";

interface CancellationConfirmationEmailProps {
  firstName: string;
  scheduledAt: Date;
  refundAmountPence?: number;
}

export default function CancellationConfirmationEmail({
  firstName, scheduledAt, refundAmountPence,
}: CancellationConfirmationEmailProps) {
  return (
    <Html><Head />
      <Preview>Lesson cancellation confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}><Text style={logo}>Mariyam Driving School</Text></Section>
          <Section style={content}>
            <Heading style={h1}>Lesson Cancelled</Heading>
            <Text style={text}>Hi {firstName}, your lesson on {formatDate(scheduledAt)} at {formatTime(scheduledAt)} has been cancelled.</Text>
            {refundAmountPence && refundAmountPence > 0 ? (
              <Text style={text}>
                A refund of <strong>{formatCurrency(refundAmountPence)}</strong> has been initiated and should appear within 5–10 business days.
              </Text>
            ) : (
              <Text style={text}>As the cancellation was within 48 hours of the lesson, no refund will be issued per our cancellation policy.</Text>
            )}
            <Hr style={hr} />
            <Text style={footer}>© 2025 Mariyam Driving School · London, UK</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#F8FAFC", fontFamily: "'DM Sans', Helvetica, Arial, sans-serif" };
const container = { maxWidth: "580px", margin: "0 auto" };
const header = { backgroundColor: "#0F1F3D", padding: "24px 40px" };
const logo = { color: "#fff", fontSize: "20px", fontWeight: "700", margin: "0" };
const content = { backgroundColor: "#fff", padding: "40px" };
const h1 = { color: "#0F1F3D", fontSize: "28px", fontWeight: "700", margin: "0 0 24px" };
const text = { color: "#374151", fontSize: "16px", lineHeight: "1.6", margin: "0 0 16px" };
const hr = { borderColor: "#E5E7EB", margin: "32px 0" };
const footer = { color: "#9CA3AF", fontSize: "13px" };
