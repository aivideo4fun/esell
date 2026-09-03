import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product IDs provided nahi hain" },
        { status: 400 }
      );
    }

    // 1. Associated product images delete karein
    try {
      await prisma.productImage.deleteMany({
        where: {
          productId: { in: ids },
        },
      });
    } catch {
      // Cascade handling fallback
    }

    // 2. Products delete karein
    const result = await prisma.product.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} products successfully deleted!`,
      count: result.count,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Bulk delete failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}