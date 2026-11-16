import { readConfig } from "@/lib/admin-config";
import { homepageDefaults } from "@/lib/store-settings";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatCategory, formatProduct } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const homepage = await readConfig("HOMEPAGE", homepageDefaults);
    const [categoryRows, productRows] = await Promise.all([
      prisma.category.findMany({ where: { products: { some: { isActive: true } } }, orderBy: { displayOrder: "asc" }, take: 32 }),
      prisma.product.findMany({ where: { isActive: true }, take: 8, orderBy: { createdAt: "desc" }, include: { category: true, images: true, reviews: { where: { status: "APPROVED" }, select: { rating: true } } } }),
    ]);
    const seen = new Set<string>();
    const chosenRows = homepage.dealIds.length ? await prisma.product.findMany({ where: { id: { in: homepage.dealIds }, isActive: true }, include: { category: true, images: true, reviews: { where: { status: "APPROVED" }, select: { rating: true } } } }) : [];
    const dealProducts = homepage.dealIds.map((id) => chosenRows.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p).map(formatProduct).map((p) => ({ ...p, mrp: Math.max(p.price, p.originalPrice), image: p.images[0]?.url || "/product-placeholder.svg", reviews: p.reviewCount }));
    const categories = categoryRows.map(formatCategory).filter((c) => { const key = c.name.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; }).slice(0, 8);
    const products = productRows.map(formatProduct).map((p) => ({ ...p, mrp: p.originalPrice > p.price ? p.originalPrice : p.price, image: p.images[0]?.url || "/product-placeholder.svg", reviews: p.reviewCount, discount: p.originalPrice > p.price ? `${Math.round((p.originalPrice - p.price) / p.originalPrice * 100)}% OFF` : "" }));
    return NextResponse.json({ success: true, categories, products, dealProduct: products[0] || null, homepage, dealProducts });
  } catch { return NextResponse.json({ success: false, error: "Unable to load store", categories: [], products: [] }, { status: 503 }); }
}
