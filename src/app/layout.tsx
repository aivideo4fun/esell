import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Footer from "@/components/footer/Footer";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CatchBuddy | Smart Trending Gadgets & Lifestyle Store",
  description:
    "Shop premium trending gadgets, smart home tools with 100% verified quality & instant UPI prepaid discount.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#fafafa]`}>
        <main className="flex-1">{children}</main>

        {/* Global Policy, FAQs & Support Footer */}
        <Footer />

        {/* Working Mobile Bottom Navigation */}
        <BottomNav />

        {/* Razorpay Standard Checkout SDK */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}