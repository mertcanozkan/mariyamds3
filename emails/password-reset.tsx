import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export default function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Mariyam Driving School password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Mariyam Driving School</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Reset Your Password</Heading>
            <Text style={text}>
              We received a request to reset your password. Click the button below to choose a new one.
              This link expires in 1 hour.
            </Text>
            <Button href={resetUrl} style={button}>Reset Password</Button>
            <Text style={smallText}>
              If you didn't request this, you can safely ignore this email. Your password won't change.
            </Text>
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
const text = { color: "#374151", fontSize: "16px", lineHeight: "1.6", margin: "0 0 24px" };
const smallText = { color: "#6B7280", fontSize: "14px", lineHeight: "1.5", margin: "16px 0 0" };
const button = {
  backgroundColor: "#F5A623", color: "#0F1F3D", borderRadius: "6px",
  fontSize: "16px", fontWeight: "700", padding: "14px 28px",
  textDecoration: "none", display: "inline-block",
};
const hr = { borderColor: "#E5E7EB", margin: "32px 0" };
const footer = { color: "#9CA3AF", fontSize: "13px" };
