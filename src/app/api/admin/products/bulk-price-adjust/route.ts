import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { categoryId, adjustmentType, value } = await req.json();

    if (!categoryId || !adjustmentType || value === undefined) {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    // Fetch all products belonging to this category
    const products = await prisma.product.findMany({
      where: { categoryId },
    });

    // Update each product's price accordingly
    for (const p of products) {
      let newPrice = p.price;
      if (adjustmentType === "PERCENT") {
        newPrice = Math.round(p.price * (1 + value / 100));
      } else if (adjustmentType === "FLAT") {
        newPrice = Math.max(0, p.price + value);
      }

      await prisma.product.update({
        where: { id: p.id },
        data: { price: newPrice },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${products.length} products ki prices successfully update ho gayi hain!`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to adjust category prices";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}