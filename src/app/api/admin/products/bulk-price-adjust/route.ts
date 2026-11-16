import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  try {
    const b = await req.json(); const value = Number(b.value);
    if (typeof b.categoryId !== "string" || !["PERCENT", "FLAT"].includes(b.adjustmentType) || b.value === "" || !Number.isFinite(value)) throw new Error("Choose a category, adjustment and numeric amount");
    const products = await prisma.product.findMany({ where: { categoryId: b.categoryId } });
    const changes = products.map((p) => {
      const price = Math.round((b.adjustmentType === "PERCENT" ? p.price * (1 + value / 100) : p.price + value) * 100) / 100;
      if (!Number.isFinite(price) || price <= 0) throw new Error("Adjustment would produce a zero or negative price; no changes were applied");
      return { id: p.id, price, originalPrice: Math.max(p.originalPrice, price) };
    });
    await prisma.$transaction(changes.map(({ id, ...data }) => prisma.product.update({ where: { id }, data })));
    return NextResponse.json({ success: true, message: `${changes.length} product prices updated`, count: changes.length });
  } catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unable to update prices" }, { status: 400 }); }
}
