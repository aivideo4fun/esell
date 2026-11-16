import { NextResponse } from "next/server";
import { POST as createProduct } from "../route";
export async function POST(req: Request) {
  const body = await req.json();
  if (!Array.isArray(body.products) || !body.products.length || body.products.length > 1000) return NextResponse.json({ success: false, error: "Import 1–1000 products at a time" }, { status: 400 });
  let createdCount = 0; const errors: string[] = [];
  for (const [index, item] of body.products.entries()) {
    const images = Array.isArray(item.imageUrls) ? item.imageUrls : String(item.imageUrls || item.imageUrl || "").split(",").map((s) => s.trim()).filter(Boolean);
    const result = await createProduct(new Request(req.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...item, categorySlug: item.categorySlug || item.category || "general", stock: item.stock ?? 0, imageUrls: images, sizes: Array.isArray(item.sizes) ? item.sizes : String(item.sizes || "").split(",").map((s) => s.trim()).filter(Boolean) }) }));
    const data = await result.json(); if (data.success) createdCount++; else if (errors.length < 10) errors.push(`Row ${index + 1}: ${data.error}`);
  }
  return NextResponse.json({ success: createdCount > 0, createdCount, errors, message: `${createdCount} products created; ${body.products.length - createdCount} rows failed. ${errors.join("; ")}` }, { status: createdCount ? 200 : 400 });
}
