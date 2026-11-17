import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET() {
  const orders = await prisma.order.findMany({ where: { OR: [{ orderStatus: { in: ["RETURNED", "CANCELLED", "RETURN_APPROVED", "REFUNDED"] } }, { paymentStatus: { in: ["REFUND_PENDING", "REFUNDED"] } }] }, include: { address: true, payments: true }, orderBy: { createdAt: "desc" }, take: 1000 });
  const refunds = orders.filter((o) => o.payments.some((p) => p.status === "COMPLETED" || p.status === "REFUNDED")).map((o) => ({ id: `RF-${o.id}`, orderDbId: o.id, orderId: o.orderNumber || o.id, customer: o.address.fullName, amount: o.totalAmount, gateway: "RAZORPAY", status: o.paymentStatus === "REFUNDED" ? "COMPLETED" : "PENDING", date: o.createdAt.toLocaleDateString("en-IN") }));
  return NextResponse.json({ success: true, refunds });
}
export async function POST(req: Request) {
  try {
    const { orderDbId, refundId } = await req.json();
    if (typeof orderDbId !== "string" || typeof refundId !== "string" || !/^rfnd_[A-Za-z0-9]+$/.test(refundId)) return NextResponse.json({ success: false, error: "Enter the processed Razorpay refund ID (rfnd_...)" }, { status: 400 });
    const key = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID; const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key || !secret) return NextResponse.json({ success: false, error: "Razorpay is not configured" }, { status: 503 });
    const order = await prisma.order.findUnique({ where: { id: orderDbId }, include: { payments: true } });
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    const refund = await new Razorpay({ key_id: key, key_secret: secret }).refunds.fetch(refundId);
    if (refund.status !== "processed" || Number(refund.amount) !== Math.round(order.totalAmount * 100) || !order.payments.some((p) => p.gatewayTxnId === refund.payment_id)) return NextResponse.json({ success: false, error: "Refund is not a processed full refund for this order" }, { status: 409 });
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUNDED", orderStatus: "REFUNDED" } });
      await tx.payment.updateMany({ where: { orderId: order.id, gatewayTxnId: refund.payment_id }, data: { status: "REFUNDED" } });
      await tx.activityLog.create({ data: { action: "REFUND_VERIFIED", details: JSON.stringify({ orderId: order.id, refundId, amount: refund.amount }) } });
    });
    return NextResponse.json({ success: true, message: "Gateway refund verified and recorded" });
  } catch { return NextResponse.json({ success: false, error: "Unable to verify the gateway refund. No refund was initiated here." }, { status: 400 }); }
}
