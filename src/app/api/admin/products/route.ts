import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, price, originalPrice, stock, categorySlug, imageUrls, badge } = body;

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
      "-" +
      Date.now().toString().slice(-4);

    let category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
          slug: categorySlug,
        },
      });
    }

    // Har image URL ko ProductImage record me convert karein
    const imagesData = (imageUrls && imageUrls.length > 0
      ? imageUrls
      : ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"]
    ).map((url: string, index: number) => ({
      url: url.trim(),
      isPrimary: index === 0,
    }));

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description: description || "Quality verified product.",
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice) || parseFloat(price) * 1.4,
        stock: parseInt(stock) || 100,
        badge: badge || "BESTSELLER",
        categoryId: category.id,
        images: {
          create: imagesData,
        },
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
  }
}