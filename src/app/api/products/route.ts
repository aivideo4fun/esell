import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const searchQuery = searchParams.get("search");

    const andConditions: any[] = [];

    // 1. Category filter
    if (category && category !== "all") {
      andConditions.push({
        category: {
          slug: category,
        },
      });
    }

    // 2. Search query filter (title ya description me match)
    if (searchQuery && searchQuery.trim() !== "") {
      andConditions.push({
        OR: [
          { title: { contains: searchQuery.trim(), mode: "insensitive" } },
          { description: { contains: searchQuery.trim(), mode: "insensitive" } },
        ],
      });
    }

    const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error("DEBUG API PRODUCTS SEARCH ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}