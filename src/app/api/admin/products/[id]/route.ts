import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productInput } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true, category: true } });
  return NextResponse.json({ success: !!product, product }, { status: product ? 200 : 404 });
}
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = productInput(body, true);
    const { imageUrls, ...data } = parsed;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    if (data.price !== undefined && data.originalPrice === undefined) data.originalPrice = Math.max(existing.originalPrice, data.price);
    if (body.categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: String(body.categoryId) } });
      if (!category) throw new Error("Choose a valid category");
      data.categoryId = category.id;
    }
    const product = await prisma.product.update({ where: { id }, data: { ...data, ...(imageUrls ? { images: { deleteMany: {}, create: imageUrls.map((url: string, index: number) => ({ url, isPrimary: index === 0 })) } } : {}) }, include: { images: true, category: true } });
    return NextResponse.json({ success: true, product });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Update failed" }, { status: 400 }); }
}
export { PUT as PATCH };
