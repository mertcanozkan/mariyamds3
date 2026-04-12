import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Row, Column,
} from "@react-email/components";
import { formatDate, formatTime } from "@/lib/utils";

interface BookingConfirmationEmailProps {
  firstName: string;
  instructorName: string;
  scheduledAt: Date;
  durationMinutes: number;
  locationPickup: string;
}

export default function BookingConfirmationEmail({
  firstName,
  instructorName,
  scheduledAt,
  durationMinutes,
  locationPickup,
}: BookingConfirmationEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mariyamds.co.uk";

  return (
    <Html>
      <Head />
      <Preview>Your lesson is confirmed — {formatDate(scheduledAt)} at {formatTime(scheduledAt)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Mariyam Driving School</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Lesson Confirmed ✓</Heading>
            <Text style={text}>Hi {firstName}, your lesson has been booked and payment received.</Text>
            <Section style={detailsBox}>
              <Row>
                <Column style={detailLabel}>Date</Column>
                <Column style={detailValue}>{formatDate(scheduledAt)}</Column>
              </Row>
              <Row>
                <Column style={detailLabel}>Time</Column>
                <Column style={detailValue}>{formatTime(scheduledAt)}</Column>
              </Row>
              <Row>
                <Column style={detailLabel}>Duration</Column>
                <Column style={detailValue}>{durationMinutes} minutes</Column>
              </Row>
              <Row>
                <Column style={detailLabel}>Instructor</Column>
                <Column style={detailValue}>{instructorName}</Column>
              </Row>
              <Row>
                <Column style={detailLabel}>Pickup</Column>
                <Column style={detailValue}>{locationPickup}</Column>
              </Row>
            </Section>
            <Text style={text}>
              <strong>Cancellation policy:</strong> Lessons must be cancelled at least 48 hours in advance for a full refund.
            </Text>
            <Button href={`${appUrl}/dashboard/lessons`} style={button}>
              View My Lessons
            </Button>
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
const logo = { color: "#ffffff", fontSize: "20px", fontWeight: "700", margin: "0" };
const content = { backgroundColor: "#ffffff", padding: "40px" };
const h1 = { color: "#0F1F3D", fontSize: "28px", fontWeight: "700", margin: "0 0 24px" };
const text = { color: "#374151", fontSize: "16px", lineHeight: "1.6", margin: "0 0 16px" };
const detailsBox = { backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "20px", margin: "0 0 24px" };
const detailLabel = { color: "#6B7280", fontSize: "14px", fontWeight: "600", width: "120px", paddingBottom: "8px" };
const detailValue = { color: "#111827", fontSize: "14px", paddingBottom: "8px" };
const button = {
  backgroundColor: "#F5A623", color: "#0F1F3D", borderRadius: "6px",
  fontSize: "16px", fontWeight: "700", padding: "14px 28px",
  textDecoration: "none", display: "inline-block", margin: "8px 0 24px",
};
const hr = { borderColor: "#E5E7EB", margin: "32px 0" };
const footer = { color: "#9CA3AF", fontSize: "13px", lineHeight: "1.5" };
