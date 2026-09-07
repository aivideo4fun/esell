import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productIds, categorySlug } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Koi bhi product select nahi kiya gaya hai." },
        { status: 400 }
      );
    }

    if (!categorySlug) {
      return NextResponse.json(
        { success: false, error: "Target category select karna zaroori hai." },
        { status: 400 }
      );
    }

    // 1. Find the category by slug to get its ID
    const targetCategory = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!targetCategory) {
      return NextResponse.json(
        { success: false, error: "Selected category database mein nahi mili." },
        { status: 404 }
      );
    }

    // 2. Update multiple products with the new category ID
    await prisma.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: {
        categoryId: targetCategory.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${productIds.length} products successfully "${targetCategory.name}" category mein move ho gaye!`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to bulk assign category";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}