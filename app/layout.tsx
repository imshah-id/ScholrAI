import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { AlertProvider } from "@/components/ui/AlertSystem";

export const metadata: Metadata = {
  title: "ScholrAI | AI-Powered Study Abroad Counselor",
  description:
    "The world's first AI platform optimized for global university admissions. Analyze your profile, shortlist universities, and draft essays with precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AlertProvider>{children}</AlertProvider>
      </body>
    </html>
  );
}
