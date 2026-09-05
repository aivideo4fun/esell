import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Fetch Products with Stock and Price
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        originalPrice: true,
        stock: true,
        images: {
          select: { url: true },
          take: 1,
        },
      },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load inventory" },
      { status: 500 }
    );
  }
}

// 2. PATCH: Update Individual Product Stock or Price
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { productId, stock, price } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof stock === "number") updateData.stock = Math.max(0, stock);
    if (typeof price === "number") updateData.price = Math.max(1, price);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update" },
      { status: 500 }
    );
  }
}

// 3. POST: Bulk Percentage Price Increase for All Products
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, percentage } = body;

    if (action === "BULK_PRICE_PERCENTAGE") {
      const pct = Number(percentage);
      if (isNaN(pct) || pct === 0) {
        return NextResponse.json({ success: false, error: "Invalid percentage" }, { status: 400 });
      }

      const allProducts = await prisma.product.findMany({
        select: { id: true, price: true, originalPrice: true },
      });

      const factor = 1 + pct / 100;

      const updates = allProducts.map((p) => {
        const newPrice = Math.max(1, Math.round(p.price * factor));
        const newOriginalPrice = p.originalPrice
          ? Math.max(newPrice, Math.round(p.originalPrice * factor))
          : Math.round(newPrice * 1.3);

        return prisma.product.update({
          where: { id: p.id },
          data: {
            price: newPrice,
            originalPrice: newOriginalPrice,
          },
        });
      });

      await prisma.$transaction(updates);

      return NextResponse.json({
        success: true,
        message: `Updated all prices by ${pct}% successfully!`,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Bulk update failed" },
      { status: 500 }
    );
  }
}