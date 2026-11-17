import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
  const banners = await prisma.banner.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" }, select: { id: true, title: true, subtitle: true, imageUrl: true, linkUrl: true, badgeText: true, isActive: true } });
  return NextResponse.json({ success: true, banners });
}
