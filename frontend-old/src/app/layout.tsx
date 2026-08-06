import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Eloquent One - Communication Coach",
  description: "Improve your interview performance and public speaking with real-time telemetry feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased text-slate-100 min-h-screen`} suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
