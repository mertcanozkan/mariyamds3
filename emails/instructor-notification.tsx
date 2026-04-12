import {
  Body, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from "@react-email/components";
import { formatDate, formatTime } from "@/lib/utils";

interface InstructorNotificationEmailProps {
  instructorFirstName: string;
  studentName: string;
  scheduledAt: Date;
  durationMinutes: number;
  locationPickup: string;
  lessonType: string;
}

export default function InstructorNotificationEmail({
  instructorFirstName, studentName, scheduledAt, durationMinutes, locationPickup, lessonType,
}: InstructorNotificationEmailProps) {
  return (
    <Html><Head />
      <Preview>New booking: {studentName} on {formatDate(scheduledAt)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}><Text style={logo}>Mariyam Driving School</Text></Section>
          <Section style={content}>
            <Heading style={h1}>New Lesson Booked</Heading>
            <Text style={text}>Hi {instructorFirstName}, you have a new lesson booking.</Text>
            <Section style={box}>
              <Text style={detail}><strong>Student:</strong> {studentName}</Text>
              <Text style={detail}><strong>Date:</strong> {formatDate(scheduledAt)}</Text>
              <Text style={detail}><strong>Time:</strong> {formatTime(scheduledAt)}</Text>
              <Text style={detail}><strong>Duration:</strong> {durationMinutes} minutes</Text>
              <Text style={detail}><strong>Type:</strong> {lessonType.replace(/_/g, " ")}</Text>
              <Text style={detail}><strong>Pickup:</strong> {locationPickup}</Text>
            </Section>
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
const h1 = { color: "#0F1F3D", fontSize: "28px", fontWeight: "700", margin: "0 0 16px" };
const text = { color: "#374151", fontSize: "16px", lineHeight: "1.6", margin: "0 0 16px" };
const box = { backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "20px", margin: "0 0 24px" };
const detail = { color: "#374151", fontSize: "15px", margin: "0 0 8px" };
const hr = { borderColor: "#E5E7EB", margin: "32px 0" };
const footer = { color: "#9CA3AF", fontSize: "13px" };
