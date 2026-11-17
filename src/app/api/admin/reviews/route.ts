import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
  const reviews = await prisma.review.findMany({ include: { product: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 500 });
  return NextResponse.json({ success: true, reviews });
}
export async function PATCH(req: Request) {
  const { id, status } = await req.json();
  if (typeof id !== "string" || !["APPROVED", "PENDING", "REJECTED"].includes(status)) return NextResponse.json({ success: false, error: "Invalid review status" }, { status: 400 });
  const review = await prisma.review.update({ where: { id }, data: { status } });
  return NextResponse.json({ success: true, review });
}
export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ success: false }, { status: 400 });
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
