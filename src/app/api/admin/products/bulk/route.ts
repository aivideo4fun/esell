import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { products } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, error: "CSV mein koi valid product nahi mila" }, { status: 400 });
    }

    let createdCount = 0;

    for (const item of products) {
      const title = String(item.title || "").trim();
      const price = parseFloat(item.price);

      if (!title || isNaN(price)) continue;

      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "") +
        "-" +
        Math.floor(1000 + Math.random() * 9000);

      const categorySlug = String(item.category || "general")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-");

      // Category check ya auto-create
      let category = await prisma.category.findFirst({
        where: {
          OR: [{ slug: categorySlug }, { name: categorySlug }],
        },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
            slug: categorySlug,
          },
        });
      }

      // Sizes format
      const sizes = item.sizes ? `\n\n[Sizes: ${String(item.sizes).trim()}]` : "";
      const description = (item.description || "Quality verified product.") + sizes;

      // Images parsing (comma separated links)
      const rawImages = String(item.imageUrls || item.imageUrl || "")
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.startsWith("http"));

      const imagesData = (
        rawImages.length > 0
          ? rawImages
          : ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80"]
      ).map((url, idx) => ({
        url,
        isPrimary: idx === 0,
      }));

      await prisma.product.create({
        data: {
          title,
          slug,
          description,
          price,
          originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : price * 1.4,
          stock: item.stock ? parseInt(item.stock) : 100,
          badge: item.badge || "BESTSELLER",
          categoryId: category.id,
          images: {
            create: imagesData,
          },
        },
      });

      createdCount++;
    }

    return NextResponse.json({
      success: true,
      message: `${createdCount} products successfully database mein live ho gaye!`,
      count: createdCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bulk upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}