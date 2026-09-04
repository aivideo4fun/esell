import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Fetch Categories with Live Real Product Counts
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      displayOrder: c.displayOrder,
      productCount: c._count?.products || 0,
      itemCount: c._count?.products || 0,
    }));

    return NextResponse.json({ success: true, categories: formatted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load categories" },
      { status: 500 }
    );
  }
}

// 2. DELETE: Safe Delete with Total Cascade Unlinking
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    // Agar body mein id bheji ho
    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Step A: Sub-categories ka parentId null karein
    try {
      await (prisma.category as any).updateMany({
        where: { parentId: id },
        data: { parentId: null },
      });
    } catch {}

    // Step B: Direct Category-Product unlinking (1-to-many relation)
    try {
      await (prisma.product as any).updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
    } catch {}

    // Step C: Many-to-many disconnect (agar Prisma implicit relation hai)
    try {
      await prisma.category.update({
        where: { id },
        data: {
          products: {
            set: [],
          },
        },
      });
    } catch {}

    // Step D: Ab clean delete karein
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error deleting category" },
      { status: 500 }
    );
  }
}