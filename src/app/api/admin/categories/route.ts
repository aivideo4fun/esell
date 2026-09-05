import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Fetch Categories with Live Product Count
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
    }));

    return NextResponse.json({ success: true, categories: formatted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load categories" },
      { status: 500 }
    );
  }
}

// 2. POST: Create OR Safe Delete
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, name, icon } = body;

    // --- CASE A: DELETE CATEGORY ---
    if (action === "DELETE" || id) {
      const targetId = id;
      if (!targetId) {
        return NextResponse.json(
          { success: false, error: "Category ID is required" },
          { status: 400 }
        );
      }

      // Step 1: Subcategories ka parent unlink
      try {
        await (prisma.category as any).updateMany({
          where: { parentId: targetId },
          data: { parentId: null },
        });
      } catch {}

      // Step 2: Product_categoryId_fkey RESTRICT bypass
      // Pehle categoryId ko null karne ki koshish karein
      let unlinked = false;
      try {
        await (prisma.product as any).updateMany({
          where: { categoryId: targetId },
          data: { categoryId: null },
        });
        unlinked = true;
      } catch {
        // Agar schema me categoryId required (not nullable) hai
        unlinked = false;
      }

      // Agar categoryId null nahi ho sakta (RESTRICT error ki wajah), toh products ko default category me shift karein
      if (!unlinked) {
        // Ek fallback "General" category dhoondein ya banayein
        let fallbackCategory = await prisma.category.findFirst({
          where: {
            id: { not: targetId },
          },
        });

        if (!fallbackCategory) {
          fallbackCategory = await prisma.category.create({
            data: {
              name: "General",
              slug: "general",
              icon: "📦",
              displayOrder: 99,
            },
          });
        }

        // Saare linked products ko is safe category par move karein
        await prisma.product.updateMany({
          where: { categoryId: targetId },
          data: { categoryId: fallbackCategory.id },
        });
      }

      // Step 3: Ab category ko bina foreign key restriction ke delete karein
      await prisma.category.delete({
        where: { id: targetId },
      });

      return NextResponse.json({
        success: true,
        message: "Category deleted successfully",
      });
    }

    // --- CASE B: CREATE CATEGORY ---
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug,
        icon: icon?.trim() || null,
        displayOrder: 0,
      },
    });

    return NextResponse.json({
      success: true,
      category: {
        ...newCategory,
        productCount: 0,
      },
    });
  } catch (error: any) {
    console.error("Category Action Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Operation failed" },
      { status: 500 }
    );
  }
}