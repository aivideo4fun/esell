import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Default initial config based on your exact screenshot
const defaultFooterConfig = {
  aboutText:
    "India's direct shopping store for verified smart gadgets, kitchen tools, toys, and lifestyle utilities. Quality checked before every dispatch.",
  whatsappNumber: "+919876543210",
  shopLinks: [
    { title: "All Products", url: "/shop" },
    { title: "Smart Gadgets", url: "/shop?category=smart-gadgets" },
    { title: "Kitchen Essentials", url: "/shop?category=kitchen" },
    { title: "Toys & Games", url: "/shop?category=toys" },
  ],
  customerLinks: [
    { title: "Track Your Order", url: "/track" },
    { title: "Shipping & Delivery", url: "/shipping-policy" },
    { title: "Return Policy", url: "/return-policy" },
    { title: "FAQs", url: "/faq" },
    { title: "Blog & Guides", url: "/blog" },
    { title: "Contact Us", url: "/contact" },
  ],
  assurancePoints: [
    "100% Quality Checked Items",
    "Instant ₹50 Prepaid UPI Off",
    "Fast Tracked Pan-India Delivery",
  ],
  bottomLinks: [
    { title: "Shipping", url: "/shipping-policy" },
    { title: "Replacement", url: "/terms" },
    { title: "Privacy", url: "/privacy" },
    { title: "Support", url: "/faq" },
  ],
  copyrightText: "© 2026 CatchBuddy Technologies. All rights reserved.",
};

let memoryFooter = { ...defaultFooterConfig };

// 1. GET: Fetch Footer Config
export async function GET() {
  try {
    const config = await (prisma as any).storeSetting?.findUnique({
      where: { key: "FOOTER_CONFIG" },
    });

    if (config?.value) {
      return NextResponse.json({ success: true, footer: JSON.parse(config.value) });
    }
  } catch {
    // DB fallback to memory
  }

  return NextResponse.json({ success: true, footer: memoryFooter });
}

// 2. POST: Update Footer Config (From Admin Panel)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    try {
      if ((prisma as any).storeSetting) {
        await (prisma as any).storeSetting.upsert({
          where: { key: "FOOTER_CONFIG" },
          update: { value: JSON.stringify(body) },
          create: { key: "FOOTER_CONFIG", value: JSON.stringify(body) },
        });
      }
    } catch {
      // Memory fallback
    }

    memoryFooter = { ...memoryFooter, ...body };
    return NextResponse.json({ success: true, footer: memoryFooter });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update footer";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}