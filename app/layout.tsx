import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quick Copy 2 - Custom T-Shirt Designer",
  description: "Professional custom T-shirt printing and design services. Create your perfect custom shirts with our easy-to-use designer.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  keywords: ["custom t-shirts", "printing", "design", "quick copy", "tshirt designer"],
  authors: [{ name: "Quick Copy 2" }],
  robots: "index, follow",
  openGraph: {
    title: "Quick Copy 2 - Custom T-Shirt Designer",
    description: "Professional custom T-shirt printing and design services.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.supabase.co" />
        <link rel="dns-prefetch" href="https://www.paypal.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
