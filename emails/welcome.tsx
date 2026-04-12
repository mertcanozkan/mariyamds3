import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Link, Preview, Section, Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  firstName: string;
}

export default function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mariyamds.co.uk";

  return (
    <Html>
      <Head />
      <Preview>Welcome to Mariyam Driving School — your journey starts here.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Mariyam Driving School</Text>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Welcome, {firstName}!</Heading>
            <Text style={text}>
              We're thrilled to have you on board. Your account is set up and you're ready to book your first lesson.
            </Text>
            <Text style={text}>Here's what to do next:</Text>
            <Text style={checklist}>✅ Complete your profile</Text>
            <Text style={checklist}>✅ Browse our courses and packages</Text>
            <Text style={checklist}>✅ Book your first lesson</Text>
            <Button href={`${appUrl}/dashboard`} style={button}>
              Go to Your Dashboard
            </Button>
            <Hr style={hr} />
            <Text style={footer}>
              Questions? Reply to this email or call us on{" "}
              <Link href="tel:+442071234567">020 7123 4567</Link>.
            </Text>
            <Text style={footer}>
              © 2025 Mariyam Driving School · London, UK
            </Text>
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
const text = { color: "#374151", fontSize: "16px", lineHeight: "1.6", margin: "0 0 12px" };
const checklist = { color: "#374151", fontSize: "16px", lineHeight: "1.6", margin: "0 0 8px", paddingLeft: "8px" };
const button = {
  backgroundColor: "#F5A623", color: "#0F1F3D", borderRadius: "6px",
  fontSize: "16px", fontWeight: "700", padding: "14px 28px",
  textDecoration: "none", display: "inline-block", margin: "24px 0",
};
const hr = { borderColor: "#E5E7EB", margin: "32px 0" };
const footer = { color: "#9CA3AF", fontSize: "13px", lineHeight: "1.5", margin: "0 0 8px" };
