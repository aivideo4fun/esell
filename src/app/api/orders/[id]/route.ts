import { invoiceSellerAddress } from "@/lib/invoice-seller";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/security/customer";
export const dynamic = "force-dynamic";
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCustomerId();
  if (!userId) return NextResponse.json({ success: false, error: "Please sign in" }, { status: 401 });
  const { id } = await params;
  const order = await prisma.order.findFirst({ where: { userId, OR: [{ id }, { orderNumber: id }, { orderNumber: `CB-${id.replace(/^CB-/i, "")}` }] }, include: { address: true, payments: true, items: { include: { product: { select: { title: true, slug: true, images: true } } } } } });
  return NextResponse.json({ success: !!order, order, ...(order ? { seller: { registeredAddress: invoiceSellerAddress } } : {}) }, { status: order ? 200 : 404 });
}
