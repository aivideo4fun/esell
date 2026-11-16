import { removeCategory } from "@/lib/admin-categories";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { textField } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
export async function GET() {
  const rows = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ success: true, categories: rows.map((c) => ({ ...c, productCount: c._count.products })) });
}
export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (b.action === "DELETE") { await removeCategory(textField(b.id, "category ID")); return NextResponse.json({ success: true }); }
    const name = textField(b.name, "category name", 100);
    const slug = name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
    if (!slug) throw new Error("Enter a category name");
    const existing = await prisma.category.findFirst({ where: { OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }] } });
    if (existing) return NextResponse.json({ success: false, error: "Category already exists" }, { status: 409 });
    const category = await prisma.category.create({ data: { name, slug, icon: typeof b.icon === "string" ? b.icon.slice(0, 100) : null } });
    return NextResponse.json({ success: true, category: { ...category, productCount: 0 } });
  } catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Category update failed" }, { status: 400 }); }
}
