import { getCustomerId } from "@/lib/security/customer";
import { rateLimit } from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
  }
  try {
    const reviews = await prisma.review.findMany({
      where: { productId, status: "APPROVED" },
      select: { id: true, customerName: true, rating: true, comment: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, reviews });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to load reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { productId, rating, comment, userName } = body ?? {};
  if (
    typeof productId !== "string" || !productId.trim() || productId.length > 200 ||
    typeof userName !== "string" || !userName.trim() || userName.trim().length > 100 ||
    typeof comment !== "string" || !comment.trim() || comment.trim().length > 5000 ||
    typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5
  ) {
    return NextResponse.json({ success: false, error: "Enter a name, review and a rating from 1 to 5" }, { status: 400 });
  }
  try {
    const product = await prisma.product.findFirst({ where: { id: productId, isActive: true }, select: { id: true } });
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    const userId = await getCustomerId();
    if (!userId) return NextResponse.json({ success: false, error: "Please sign in to review your purchase" }, { status: 401 });
    if (!(await rateLimit("reviews", userId, 5))) return NextResponse.json({ success: false, error: "Too many review attempts" }, { status: 429 });
    const delivered = await prisma.orderItem.findFirst({ where: { productId, order: { userId, orderStatus: "DELIVERED", paymentStatus: "SUCCESS" } } });
    if (!delivered) return NextResponse.json({ success: false, error: "Reviews are available after your order is delivered" }, { status: 403 });
    const duplicate = await prisma.review.findFirst({ where: { userId, productId } });
    if (duplicate) return NextResponse.json({ success: false, error: "You have already reviewed this product" }, { status: 409 });
    const customer = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } });
    const review = await prisma.review.create({
      data: { productId, userId, rating, comment: comment.trim(), customerName: customer.name || "Customer" },
      select: { id: true, customerName: true, rating: true, comment: true, createdAt: true },
    });
    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Review submission failed" }, { status: 500 });
  }
}
