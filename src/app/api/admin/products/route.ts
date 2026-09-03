import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Admin Products table ke liye
export async function GET() {
  try {
    const products = await prisma.product.findMany({
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

// 2. POST: Naya Product Create karne ke liye (With Sizes & Bulk Images Support)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, price, originalPrice, stock, categorySlug, imageUrls, badge, sizes } = body;

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
      "-" +
      Date.now().toString().slice(-4);

    let category = await prisma.category.findFirst({
      where: {
        OR: [{ slug: categorySlug }, { name: categorySlug }],
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
          slug: categorySlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
        },
      });
    }

    const imagesData = (imageUrls && imageUrls.length > 0
      ? imageUrls
      : ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"]
    ).map((url: string, index: number) => ({
      url: url.trim(),
      isPrimary: index === 0,
    }));

    // Fashion Sizes ko safe format mein description ke sath attach karein
    const sizesSuffix =
      Array.isArray(sizes) && sizes.length > 0
        ? `\n\n[Sizes: ${sizes.join(", ")}]`
        : "";

    const finalDescription = (description || "Quality verified product.") + sizesSuffix;

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description: finalDescription,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price) * 1.4,
        stock: parseInt(stock) || 100,
        badge: badge || "BESTSELLER",
        categoryId: category.id,
        images: {
          create: imagesData,
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 3. DELETE: Product Delete karne ke liye
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}