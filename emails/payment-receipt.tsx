import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Row, Column,
} from "@react-email/components";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PaymentReceiptEmailProps {
  firstName: string;
  amountPence: number;
  description: string;
  paidAt: Date;
}

export default function PaymentReceiptEmail({
  firstName, amountPence, description, paidAt,
}: PaymentReceiptEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mariyamds.co.uk";
  return (
    <Html><Head />
      <Preview>Payment receipt — {formatCurrency(amountPence)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}><Text style={logo}>Mariyam Driving School</Text></Section>
          <Section style={content}>
            <Heading style={h1}>Payment Received</Heading>
            <Text style={text}>Hi {firstName}, here's your receipt.</Text>
            <Section style={box}>
              <Row><Column style={label}>Description</Column><Column style={value}>{description}</Column></Row>
              <Row><Column style={label}>Amount</Column><Column style={value}>{formatCurrency(amountPence)}</Column></Row>
              <Row><Column style={label}>Date</Column><Column style={value}>{formatDate(paidAt)}</Column></Row>
              <Row><Column style={label}>Status</Column><Column style={{ ...value, color: "#16a34a", fontWeight: "700" }}>Paid</Column></Row>
            </Section>
            <Button href={`${appUrl}/dashboard/payments`} style={button}>View All Payments</Button>
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
const text = { color: "#374151", fontSize: "16px", lineHeight: "1.6", margin: "0 0 24px" };
const box = { backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "20px", margin: "0 0 24px" };
const label = { color: "#6B7280", fontSize: "14px", fontWeight: "600", width: "130px", paddingBottom: "8px" };
const value = { color: "#111827", fontSize: "14px", paddingBottom: "8px" };
const button = { backgroundColor: "#F5A623", color: "#0F1F3D", borderRadius: "6px", fontSize: "16px", fontWeight: "700", padding: "14px 28px", textDecoration: "none", display: "inline-block" };
const hr = { borderColor: "#E5E7EB", margin: "32px 0" };
const footer = { color: "#9CA3AF", fontSize: "13px" };
