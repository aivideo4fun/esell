import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
    // 1. Fetch top 8 Main Categories (where parentId is null)
    let rawCategories = await prisma.category.findMany({
      where: { parentId: null },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true, icon: true },
    });

    if (rawCategories.length === 0) {
      rawCategories = await prisma.category.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, slug: true, icon: true },
      });
    }
    const categories = rawCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug || c.name.toLowerCase().replace(/\s+/g, "-"),
      icon: getCategoryIcon(c.name, c.icon),
    }));

    // Fetch products including full images relation
    const products = await prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
      },
    });

    const formattedProducts = products.map((p: any) => {
      const price = p.price || 0;
      const mrp = p.originalPrice || p.mrp || Math.round(price * 1.3);
      const discount = mrp > price ? `${Math.round(((mrp - price) / mrp) * 100)}% OFF` : "SPECIAL";

      // Proper Image Extractor with strict /logo.png fallback (ignoring unsplash)
      let img = "";
      if (Array.isArray(p.images) && p.images.length > 0) {
        const first = p.images[0];
        if (typeof first === "string") img = first;
        else if (first?.url) img = first.url;
      } else if (typeof p.image === "string") {
        img = p.image;
      } else if (typeof p.imageUrl === "string") {
        img = p.imageUrl;
      }

      const finalImg = img && img.trim() !== "" && !img.includes("unsplash.com") ? img : "/logo.png";

      return {
        id: p.id,
        slug: p.slug || p.id,
        title: p.title || p.name || "Product",
        price: price,
        mrp: mrp,
        discount: p.badge || discount,
        rating: p.rating || 4.5,
        reviews: p.reviewCount ? `${p.reviewCount}` : "120+",
        image: finalImg,
      };
    });

    const activeCoupon = await prisma.coupon.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      categories: categories.length > 0 ? categories : null,
      products: formattedProducts.length > 0 ? formattedProducts : null,
      coupon: activeCoupon || null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({
      success: false,
      categories: null,
      products: null,
      coupon: null,
      error: msg,
    });
  }
}