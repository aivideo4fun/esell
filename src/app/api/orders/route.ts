import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/security/customer";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const userId = await getCustomerId();
  if (!userId) return NextResponse.json({ success: false, error: "Please sign in to view orders" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("orderId");
  const orders = await prisma.order.findMany({
    where: { userId, ...(id ? { OR: [{ id }, { orderNumber: id }, { orderNumber: `CB-${id.replace(/^CB-/i, "")}` }] } : {}) },
    include: { address: true, payments: true, items: { include: { product: { select: { title: true, slug: true, images: true } } } } },
    orderBy: { createdAt: "desc" }, take: 100,
  });
  return NextResponse.json({ success: true, orders });
}
export { createPayment as POST } from "@/lib/payment-routes";
