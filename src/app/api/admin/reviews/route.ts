import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// 1. GET: Public Approved Reviews
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
    });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : "5.0";

    return NextResponse.json({
      success: true,
      reviews,
      avgRating: parseFloat(avgRating),
      totalReviews,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load reviews";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. POST: Submit Review with Strict DELIVERED Verification
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, rating, comment, customerName, phone } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: "Rating and comment are required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("customer_id")?.value;
    const cleanPhone = phone ? String(phone).trim().replace(/\D/g, "") : "";

    // 🔒 DELIVERY VERIFICATION CHECK
    // Customer ne ye product order kiya ho AUR uska status "DELIVERED" ho chuka ho
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        orderStatus: "DELIVERED",
        OR: [
          sessionUserId ? { userId: sessionUserId } : {},
          cleanPhone ? { customerPhone: cleanPhone } : {},
          cleanPhone.length === 10 ? { customerPhone: `+91${cleanPhone}` } : {},
        ].filter((cond) => Object.keys(cond).length > 0),
        items: {
          some: {
            productId: productId,
          },
        },
      },
    });

    if (!deliveredOrder) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Aap review sirf tabhi de sakte hain jab aapka order successfully DELIVER ho chuka ho.",
        },
        { status: 403 }
      );
    }

    // 💾 SAVE REVIEW MATCHING YOUR EXACT SCHEMA
    const newReview = await prisma.review.create({
      data: {
        productId,
        rating: Number(rating),
        comment: String(comment).trim(),
        customerName: customerName || deliveredOrder.customerName || "Verified Buyer",
        status: "APPROVED",
        images: [],
        userId: sessionUserId || deliveredOrder.userId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Verified review submitted successfully!",
      review: newReview,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit review";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}