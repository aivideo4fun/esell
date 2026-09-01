import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Fetch all categories matching schema relations
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Categories Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// 2. POST: Create category or subcategory
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, icon, description, parentId, displayOrder } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: name.trim() }, { slug: cleanSlug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A category with this name or slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        icon: icon?.trim() || null,
        description: description?.trim() || null,
        parentId: parentId || null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Category Create Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

// 3. DELETE: Safe delete category
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    const categoryWithProducts = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (categoryWithProducts && categoryWithProducts._count.products > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete: Category contains ${categoryWithProducts._count.products} products. Reassign products first.` 
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}