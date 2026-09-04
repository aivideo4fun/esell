import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Categories
    const categories = await prisma.category.findMany({
      take: 8,
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
      },
    });

    // 2. Best Selling / Featured Products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        originalPrice: true,
        badge: true,
        rating: true,
        reviewCount: true,
        images: {
          select: { url: true },
          take: 1,
        },
      },
    });

    // Format products for frontend consumption
    const formattedProducts = products.map((p) => {
      const discount =
        p.originalPrice > p.price
          ? `${Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF`
          : null;

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        price: p.price,
        mrp: p.originalPrice,
        discount: discount || p.badge || "DEAL",
        rating: p.rating || 4.5,
        reviews: p.reviewCount ? `${p.reviewCount}` : "120+",
        image:
          p.images?.[0]?.url ||
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
      };
    });

    // 3. Deal of the day (First featured product or fallback)
    const dealProduct = formattedProducts[0] || null;

    return NextResponse.json({
      success: true,
      categories: categories.length > 0 ? categories : null,
      products: formattedProducts.length > 0 ? formattedProducts : null,
      dealProduct,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load storefront data";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}