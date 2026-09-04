import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = body.code?.trim().toUpperCase();
    const cartTotal = Number(body.cartTotal || body.total || 0);

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Please enter a coupon code" },
        { status: 400 }
      );
    }

    // 1. Database se coupon fetch karein
    let coupon: any = null;
    try {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: {
            equals: code,
            mode: "insensitive",
          },
        },
      });
    } catch (e) {
      console.error("Prisma coupon find error:", e);
    }

    // 2. Admin Panel Fallback Check (WINTER50 aur CATCH10 ke liye)
    if (!coupon) {
      if (code === "WINTER50") {
        coupon = {
          code: "WINTER50",
          discountType: "PERCENTAGE",
          discountValue: 50,
          minOrderValue: 0,
          isActive: true,
          expiryDate: new Date("2026-09-17"),
        };
      } else if (code === "CATCH10") {
        coupon = {
          code: "CATCH10",
          discountType: "PERCENTAGE",
          discountValue: 10,
          minOrderValue: 0,
          isActive: true,
        };
      }
    }

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Status check
    if (coupon.isActive === false) {
      return NextResponse.json(
        { success: false, message: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    // Expiry check
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json(
        { success: false, message: "This coupon has expired" },
        { status: 400 }
      );
    }

    // Usage limit check
    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    // Min Order check
    const minOrder = Number(coupon.minOrderValue || coupon.minOrder || 0);
    if (cartTotal < minOrder) {
      return NextResponse.json(
        { success: false, message: `Minimum order of ₹${minOrder} required` },
        { status: 400 }
      );
    }

    // Calculation (Percentage vs Flat)
    let discountAmount = 0;
    const isPercent =
      coupon.discountType === "PERCENTAGE" ||
      coupon.discountType === "PERCENT" ||
      Boolean(coupon.discountPercent);

    const val = Number(coupon.discountValue || coupon.discountPercent || 0);

    if (isPercent) {
      discountAmount = Math.round((cartTotal * val) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = val;
    }

    discountAmount = Math.min(discountAmount, cartTotal);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountAmount: discountAmount,
        discountPercent: isPercent ? val : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}