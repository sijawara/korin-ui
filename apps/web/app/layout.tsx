import "./globals.css";

import type { Metadata } from "next";

import { ThemeProvider } from "../components/providers/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Korin UI - Beautifully Designed React Components",
    template: "%s | Korin UI",
  },
  description:
    "Build stunning, accessible web applications faster with Korin UI. A growing collection of beautifully designed, production-ready React components powered by Radix UI and Tailwind CSS, inspired by Shadcn UI.",
  keywords: [
    "Next.js",
    "React",
    "Tailwind CSS",
    "Radix UI",
    "UI Components",
    "Korin UI",
    "Design System",
    "React Components",
    "UI Library",
    "Web Development",
  ],
  authors: [{ name: "Korin AI", url: "https://korinai.com" }],
  creator: "Korin AI",
  publisher: "Korin AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ui.korinai.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://ui.korinai.com",
    siteName: "Korin UI",
    title: "Korin UI - Beautifully Designed React Components",
    description:
      "Build stunning, accessible web applications faster with Korin UI. A growing collection of beautifully designed, production-ready React components.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Korin UI - Beautifully Designed React Components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Korin UI - Beautifully Designed React Components",
    description:
      "Build stunning, accessible web applications faster with Korin UI. Production-ready components powered by Radix UI and Tailwind CSS.",
    creator: "@korinai",
    images: ["/twitter-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://ui.korinai.com",
  },
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
