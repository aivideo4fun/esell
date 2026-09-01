import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const whereClause: Prisma.ProductWhereInput = {};

    if (category && category !== "ALL") {
      whereClause.category = {
        name: { equals: category, mode: "insensitive" },
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load products";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}