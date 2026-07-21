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

export const metadata: Metadata = {
  title: "ibi-test",
  description: "Home assignment for ibi.",
  icons: {
    icon: [
      { url: "/favicon2/favicon.ico", sizes: "48x48" },
      { url: "/favicon2/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon2/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/favicon2/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  manifest: "/favicon2/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
