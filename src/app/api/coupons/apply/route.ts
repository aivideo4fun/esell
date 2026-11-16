import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const total = Number(body.cartTotal ?? body.total);
    if (!code || !Number.isFinite(total) || total <= 0) return NextResponse.json({ success: false, message: "Enter a valid coupon and cart total" }, { status: 400 });
    const c = await prisma.coupon.findFirst({ where: { code: { equals: code, mode: "insensitive" }, isActive: true } });
    const now = new Date();
    if (!c || c.validFrom > now || (c.validTo && c.validTo < now) || (c.usageLimit !== null && c.usageCount >= c.usageLimit) || total < c.minOrderValue) return NextResponse.json({ success: false, message: "Coupon unavailable or minimum order not met" }, { status: 400 });
    let amount = c.discountType === "PERCENTAGE" ? Math.round(total * c.discountValue) / 100 : c.discountType === "FLAT" ? c.discountValue : 0;
    if (c.maxDiscount !== null) amount = Math.min(amount, c.maxDiscount);
    amount = Math.max(0, Math.min(amount, total));
    // This is a preview; checkout always recalculates from database product prices.
    return NextResponse.json({ success: true, coupon: { code: c.code, discountAmount: amount, discountPercent: c.discountType === "PERCENTAGE" ? c.discountValue : null, type: c.discountType === "PERCENTAGE" ? "PERCENT" : "FLAT", value: c.discountValue } });
  } catch { return NextResponse.json({ success: false, message: "Unable to validate coupon" }, { status: 503 }); }
}
