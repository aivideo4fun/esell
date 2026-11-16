import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatCategory } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export async function GET() {
  const rows = await prisma.category.findMany({ where: { products: { some: { isActive: true } } }, orderBy: { displayOrder: "asc" }, select: { id: true, name: true, slug: true, icon: true } });
  const seen = new Set<string>();
  const categories = rows.map(formatCategory).filter((row) => {
    const key = row.name.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true;
  });
  return NextResponse.json({ success: true, categories });
}
