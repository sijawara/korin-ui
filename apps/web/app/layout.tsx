import "./globals.css";

import type { Metadata } from "next";

import { ThemeProvider } from "../components/providers/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "KorinAI UI - Modern UI Components for Next.js",
    template: "%s | KorinAI UI",
  },
  description:
    "A collection of beautiful, accessible, and customizable UI components built with Radix UI and Tailwind CSS for Next.js applications.",
  keywords: ["Next.js", "React", "Tailwind CSS", "Radix UI", "UI Components", "KorinAI UI", "Design System"],
  authors: [{ name: "Korin AI" }],
  creator: "Korin AI",
  publisher: "Korin AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ui.korinai.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://ui.korinai.com",
    siteName: "KorinAI UI",
    title: "KorinAI UI - Modern UI Components for Next.js",
    description:
      "A collection of beautiful, accessible, and customizable UI components built with Radix UI and Tailwind CSS.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KorinAI UI - Modern UI Components for Next.js",
    description:
      "A collection of beautiful, accessible, and customizable UI components built with Radix UI and Tailwind CSS.",
    creator: "@korinai",
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
