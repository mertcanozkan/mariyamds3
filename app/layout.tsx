import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { cookies } from "next/headers";
import type { ThemeName } from "@/components/theme-provider";

const VALID_THEMES: ThemeName[] = [
  "midnight","emerald","crimson","ocean","slate","plum","rose-gold","nordic","obsidian",
];

const playfair = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = Jost({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mariyam Driving School — Your Journey Starts Here",
    template: "%s | Mariyam Driving School",
  },
  description:
    "Professional driving instruction across London. DVSA-approved instructors, flexible scheduling, and a proven track record. Book your first lesson today.",
  keywords: [
    "driving school london",
    "driving lessons london",
    "DVSA approved instructor",
    "learn to drive london",
    "intensive driving course",
    "driving test preparation",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Mariyam Driving School",
    title: "Mariyam Driving School — Your Journey Starts Here",
    description:
      "Professional driving instruction across London. DVSA-approved instructors, flexible scheduling.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mariyam Driving School",
    description: "Professional driving instruction across London.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("mds-theme")?.value as ThemeName | undefined;
  const theme: ThemeName = themeCookie && VALID_THEMES.includes(themeCookie) ? themeCookie : "midnight";

  return (
    <html
      lang="en"
      data-theme={theme}
      suppressHydrationWarning
      className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers>
          <ThemeProvider initialTheme={theme}>
            {children}
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
