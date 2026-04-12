import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {/* Prevent flash of wrong theme — runs before hydration */}
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){try{var t=localStorage.getItem('mds-theme');var v=['midnight','emerald','crimson','ocean','slate','plum','rose-gold','nordic','obsidian'];if(t&&v.includes(t)){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`}</Script>
        <Providers>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
