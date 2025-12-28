import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AppProviders from "./providers";

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Unitech Grand Ocean Resort & Suites",
  description:
    "Five-star standard oceanfront resort and investment property at Rupayan Beach View, Cox’s Bazar. Invest, relax, and earn.",
  metadataBase: new URL("https://unitechgrandocean.com.bd"),
  openGraph: {
    title: "Unitech Grand Ocean Resort & Suites",
    description:
      "Five-star standard oceanfront resort and investment property at Rupayan Beach View, Cox’s Bazar.",
    url: "https://unitechgrandocean.com.bd",
    siteName: "Unitech Grand Ocean",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable}`}>
        <Header />
        <AppProviders>
          <main>{children}</main>
        </AppProviders>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
