import { readConfig } from "@/lib/admin-config";
import { seoDefaults } from "@/lib/seo-settings";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Footer from "@/components/footer/Footer";
import BottomNav from "@/components/BottomNav";
import { BackButtonHandler } from "@/components/BackButtonHandler";

const inter = Inter({ subsets: ["latin"] });

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  let seo = seoDefaults;
  try { seo = await readConfig("SEO", seoDefaults); } catch { /* Public defaults remain available if the database is offline. */ }
  return { title: seo.metaTitle, description: seo.metaDescription, keywords: seo.keywords, ...(seo.googleSiteVerification ? { verification: { google: seo.googleSiteVerification } } : {}) };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-[#fafafa]`}
        suppressHydrationWarning={true}
      >
        <BackButtonHandler />

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