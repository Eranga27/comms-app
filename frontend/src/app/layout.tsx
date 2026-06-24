import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpeakIQ - Communication Coach",
  description: "Improve your interview performance and public speaking with real-time telemetry feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased text-slate-100 bg-slate-950`} suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
