import { formatProduct } from "@/lib/catalog";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Cache completely bypass karein taaki stock change hote hi instant live ho
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    // 'q' ya 'search' dono me se jo bhi aaye support karein
    const search = searchParams.get("q") || searchParams.get("search");
    const limitParam = searchParams.get("limit");
    const parsedLimit = Number(limitParam);
    const limit = limitParam && Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 500) : 500;

    const whereClause: Prisma.ProductWhereInput = { isActive: true };

    if (category && category !== "ALL") {
      whereClause.category = {
        OR: [{ name: { equals: category, mode: "insensitive" } }, { slug: category }],
      };
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      whereClause.OR = [
        { title: { contains: cleanSearch, mode: "insensitive" } },
        { description: { contains: cleanSearch, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        category: true,
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: limit } : {}),
    });

    return NextResponse.json(
      { success: true, products: products.map(formatProduct) },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load products";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}