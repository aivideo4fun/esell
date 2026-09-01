import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Sabhi products with current stock status
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
      },
      orderBy: { stock: "asc" }, // Low stock wale pehle dikhenge
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// 2. PATCH: Instant stock update (Direct quantity ya increment/decrement)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { productId, stock } = body;

    if (!productId || typeof stock !== "number") {
      return NextResponse.json(
        { success: false, error: "Valid Product ID and stock quantity required" },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: Math.max(0, stock), // Stock negative na jaye
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update stock" },
      { status: 500 }
    );
  }
}