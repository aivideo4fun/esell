import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Total registered customers count
    const totalCustomers = await prisma.user.count();

    // Database se saare coupons laayein
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    const campaigns = coupons.map((coupon, index) => {
      // Expiry check
      const isExpired = coupon.validTo ? new Date() > new Date(coupon.validTo) : false;
      const status = !coupon.isActive
        ? "PAUSED"
        : isExpired
        ? "EXPIRED"
        : "RUNNING";

      const discountLabel =
        coupon.discountType === "PERCENTAGE"
          ? `${coupon.discountValue}% OFF${coupon.maxDiscount ? ` (Up to ₹${coupon.maxDiscount})` : ""}`
          : `Flat ₹${coupon.discountValue} OFF`;

      return {
        id: coupon.id,
        code: coupon.code,
        campaignId: `CMP-${String(index + 1).padStart(2, "0")}`,
        title: coupon.description || `${coupon.code} Promotional Boost`,
        channel: coupon.discountType === "PERCENTAGE" ? "WhatsApp & SMS Flash" : "Storefront Banner & Push",
        target: `All Registered Customers (${totalCustomers || 1})`,
        status,
        discountLabel,
        usageCount: coupon.usageCount || 0,
        usageLimit: coupon.usageLimit,
        validTo: coupon.validTo,
      };
    });

    return NextResponse.json({ success: true, campaigns });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load campaigns";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}