import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Smart Icon Mapping for Admin Categories
function getCategoryIcon(name: string, icon: string | null): string {
  if (icon && icon.trim()) return icon;

  const n = name.toLowerCase();
  if (n.includes("wiper") || n.includes("clean")) return "🧹";
  if (n.includes("hook") || n.includes("wall")) return "🪝";
  if (n.includes("roti") || n.includes("mat")) return "🫓";
  if (n.includes("scrub") || n.includes("dishwash")) return "🧽";
  if (n.includes("glove") || n.includes("oven")) return "🧤";
  if (n.includes("rope") || n.includes("cloth")) return "🧺";
  if (n.includes("kitchen")) return "🍳";
  if (n.includes("gadget") || n.includes("electronics")) return "🎧";
  if (n.includes("fashion") || n.includes("cloth")) return "👕";
  if (n.includes("bag") || n.includes("garbage")) return "🎒";
  if (n.includes("cover") || n.includes("drain")) return "🛡️";
  if (n.includes("car")) return "🚗";
  if (n.includes("beauty")) return "💄";
  if (n.includes("toy")) return "🧸";
  if (n.includes("home")) return "🏠";
  return "📦";
}

export async function GET() {
  try {
    // 1. Fetch Admin Categories with smart ordering
    const rawCategories = await prisma.category.findMany({
      take: 12,
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
      },
    });

    const categories = rawCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug || c.name.toLowerCase().replace(/\s+/g, "-"),
      icon: getCategoryIcon(c.name, c.icon),
    }));

    // 2. Fetch Active Featured Products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 8,
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

    return NextResponse.json({
      success: true,
      categories: categories.length > 0 ? categories : null,
      products: formattedProducts.length > 0 ? formattedProducts : null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({
      success: false,
      categories: null,
      products: null,
      error: msg,
    });
  }
}