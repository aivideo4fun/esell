import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, cartAmount } = await req.json();

    if (!code || !cartAmount) {
      return NextResponse.json(
        { success: false, error: "Coupon code and cart value required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Check Coupon exists and is active
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid or inactive coupon code" },
        { status: 404 }
      );
    }

    // 2. Check Expiry
    if (coupon.validTo && new Date() > new Date(coupon.validTo)) {
      return NextResponse.json(
        { success: false, error: "This coupon code has expired" },
        { status: 400 }
      );
    }

    // 3. Check Usage Limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // 4. Check Minimum Order Value
    if (cartAmount < coupon.minOrderValue) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum cart value of ₹${coupon.minOrderValue} required for this coupon`,
        },
        { status: 400 }
      );
    }

    // 5. Calculate Discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (cartAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "FLAT") {
      discountAmount = Math.min(coupon.discountValue, cartAmount);
    } else {
      // Free Shipping
      discountAmount = 0;
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: Math.round(discountAmount),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to apply coupon";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}