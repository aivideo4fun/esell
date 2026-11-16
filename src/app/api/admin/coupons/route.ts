import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { numberField, textField } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ success: true, coupons: await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }) }); }
export async function POST(req: Request) {
  try {
    const b = await req.json(); const code = textField(b.code, "coupon code", 40).toUpperCase();
    if (!/^[A-Z0-9_-]{2,40}$/.test(code)) throw new Error("Use letters, numbers, dash or underscore in coupon codes");
    const discountType = b.discountType || "PERCENTAGE";
    if (!["PERCENTAGE", "FLAT", "FREE_SHIPPING"].includes(discountType)) throw new Error("Invalid discount type");
    const discountValue = numberField(b.discountValue, "discount", discountType === "FREE_SHIPPING" ? 0 : 0.01);
    if (discountType === "PERCENTAGE" && discountValue > 100) throw new Error("Percentage cannot exceed 100");
    const validTo = b.validTo ? new Date(b.validTo) : null; if (validTo && (!Number.isFinite(validTo.getTime()) || validTo <= new Date())) throw new Error("Choose a future expiry date");
    const existing = await prisma.coupon.findFirst({ where: { code: { equals: code, mode: "insensitive" } } });
    if (existing) return NextResponse.json({ success: false, error: "Coupon already exists" }, { status: 409 });
    const coupon = await prisma.coupon.create({ data: { code, description: typeof b.description === "string" ? b.description.slice(0, 1000) : null, discountType, discountValue, minOrderValue: numberField(b.minOrderValue || 0, "minimum order"), maxDiscount: b.maxDiscount ? numberField(b.maxDiscount, "maximum discount") : null, usageLimit: b.usageLimit ? numberField(b.usageLimit, "usage limit", 1, true) : null, validTo } });
    return NextResponse.json({ success: true, coupon });
  } catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unable to create coupon" }, { status: 400 }); }
}
export async function PATCH(req: Request) {
  const { id, isActive } = await req.json();
  if (typeof id !== "string" || typeof isActive !== "boolean") return NextResponse.json({ success: false, error: "Invalid coupon status" }, { status: 400 });
  return NextResponse.json({ success: true, coupon: await prisma.coupon.update({ where: { id }, data: { isActive } }) });
}
export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id"); if (!id) return NextResponse.json({ success: false }, { status: 400 });
  await prisma.coupon.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true, message: "Coupon deactivated; usage history retained" });
}
