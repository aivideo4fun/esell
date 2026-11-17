import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { productInput, textField } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
export async function GET() {
  const products = await prisma.product.findMany({ include: { images: true, category: true }, orderBy: { createdAt: "desc" }, take: 10000 });
  return NextResponse.json({ success: true, products });
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrls = [], ...input } = productInput(body);
    const categorySlug = textField(body.categorySlug, "category", 150);
    let category = await prisma.category.findFirst({ where: { OR: [{ slug: categorySlug }, { name: categorySlug }] } });
    if (!category) category = await prisma.category.create({ data: { name: categorySlug, slug: categorySlug.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-") } });
    const product = await prisma.product.create({ data: {
      title: input.title, slug: `${input.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 100)}-${randomUUID().slice(0, 8)}`,
      description: input.description || "", price: input.price, originalPrice: input.originalPrice ?? input.price, stock: input.stock ?? 0,
      sizes: input.sizes || [], colors: input.colors || [], badge: input.badge || null, categoryId: category.id,
      images: { create: imageUrls.map((url: string, index: number) => ({ url, isPrimary: index === 0 })) },
    }, include: { images: true, category: true } });
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Create failed" }, { status: 400 }); }
}
export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
  const result = await prisma.product.updateMany({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: result.count > 0, message: "Product archived; historical orders and photos preserved" }, { status: result.count ? 200 : 404 });
}
