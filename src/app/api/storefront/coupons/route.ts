import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
  const now = new Date();
  const rows = await prisma.coupon.findMany({ where: { isActive: true, validFrom: { lte: now }, OR: [{ validTo: null }, { validTo: { gte: now } }] }, select: { code: true, description: true, discountType: true, discountValue: true, minOrderValue: true, maxDiscount: true, usageCount: true, usageLimit: true } });
  const coupons = rows.filter((c) => c.usageLimit === null || c.usageCount < c.usageLimit).map(({ usageCount, usageLimit, ...coupon }) => coupon);
  return NextResponse.json({ success: true, coupons });
}
