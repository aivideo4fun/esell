import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { textField } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
const reserved = new Set(["admin", "api", "shop", "cart", "checkout", "contact", "terms", "privacy", "return-policy", "shipping-policy", "login", "orders", "account", "blog", "faq", "wishlist", "product"]);
export async function GET() {
  const pages = await prisma.staticPage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, pages });
}
export async function POST(req: Request) {
  try {
    const b = await req.json(); const slug = textField(b.slug, "slug", 150).replace(/^\/+|\/+$/g, "").toLowerCase();
    if (!/^[a-z0-9-]+$/.test(slug) || reserved.has(slug)) throw new Error("Choose a new page slug, such as about-us; built-in policy pages are maintained in code");
    if (!["ACTIVE", "DRAFT"].includes(b.status || "ACTIVE")) throw new Error("Invalid page status");
    const data = { title: textField(b.title, "title"), slug, content: textField(b.content || "", "content", 100000, true), status: b.status || "ACTIVE" };
    const page = b.id ? await prisma.staticPage.update({ where: { id: b.id }, data }) : await prisma.staticPage.create({ data });
    return NextResponse.json({ success: true, page });
  } catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Page save failed" }, { status: 400 }); }
}
export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id"); if (!id) return NextResponse.json({ success: false }, { status: 400 });
  await prisma.staticPage.update({ where: { id }, data: { status: "DRAFT" } });
  return NextResponse.json({ success: true, message: "Page unpublished; content retained" });
}
