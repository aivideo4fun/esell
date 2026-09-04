import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: slug }, { id: slug }],
        isActive: true,
      },
      include: {
        images: {
          select: { url: true, isPrimary: true },
        },
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error loading product";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}