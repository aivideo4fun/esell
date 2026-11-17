import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  const body = await req.json(); const ids = body.ids || body.productIds;
  if (!Array.isArray(ids) || !ids.length || ids.length > 1000 || !ids.every((id) => typeof id === "string")) return NextResponse.json({ success: false, error: "Choose 1–1000 products" }, { status: 400 });
  const result = await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
  return NextResponse.json({ success: true, count: result.count, message: `${result.count} products archived. Order history preserved.` });
}
