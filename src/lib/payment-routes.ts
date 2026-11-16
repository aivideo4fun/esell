import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/security/customer";
import { quoteCart, verifyPaymentSignature } from "@/lib/checkout";
function gateway() {
  const key = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret) throw new Error("Payments are temporarily unavailable");
  return { key, secret, api: new Razorpay({ key_id: key, key_secret: secret }) };
}
export async function createPayment(req: Request) {
  try {
    const userId = await getCustomerId();
    if (!userId) return NextResponse.json({ success: false, error: "Please sign in before checkout" }, { status: 401 });
    const body = await req.json();
    const address = body.shippingAddress || body.shippingDetails || body.customerDetails;
    if (!address || !["fullName", "street", "city", "state", "phone", "pincode"].every((key) => typeof address[key] === "string" && address[key].trim() && address[key].length <= 300) || !/^\d{6}$/.test(address.pincode) || !/^(?:\+91)?[6-9]\d{9}$/.test(address.phone.replace(/[\s-]/g, ""))) throw new Error("Enter a complete valid delivery address");
    const quote = await quoteCart(body.items || body.cartItems, body.couponCode);
    const { key, api } = gateway();
    const localOrder = await prisma.order.create({ data: {
      orderNumber: `CB-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`,
      user: { connect: { id: userId } },
      address: { create: { userId, fullName: address.fullName.trim(), phone: address.phone.trim(), street: address.street.trim(), city: address.city.trim(), state: address.state.trim(), pincode: address.pincode } },
      totalAmount: quote.totalPaise / 100, discountAmount: quote.discountPaise / 100, couponCode: quote.coupon?.code || null,
      orderStatus: "PENDING", paymentStatus: "PENDING", items: { create: quote.lines },
    } });
    try {
      const remote = await api.orders.create({ amount: quote.totalPaise, currency: "INR", receipt: localOrder.id });
      await prisma.payment.create({ data: { orderId: localOrder.id, gatewayTxnId: remote.id, amount: quote.totalPaise / 100, status: "PENDING" } });
      return NextResponse.json({ success: true, orderId: remote.id, razorpayOrderId: remote.id, key, keyId: key, amount: quote.totalPaise, currency: "INR", localOrderId: localOrder.id });
    } catch {
      await prisma.order.update({ where: { id: localOrder.id }, data: { orderStatus: "PAYMENT_FAILED", paymentStatus: "FAILED" } });
      throw new Error("Unable to initialize payment. Please retry.");
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to initialize payment" }, { status: 400 });
  }
}
export async function verifyPayment(req: Request) {
  try {
    const userId = await getCustomerId();
    if (!userId) return NextResponse.json({ success: false, error: "Please sign in" }, { status: 401 });
    const body = await req.json();
    const { razorpay_order_id: gatewayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
    const { secret, api } = gateway();
    if (typeof gatewayOrderId !== "string" || typeof paymentId !== "string" || typeof signature !== "string" || !verifyPaymentSignature(gatewayOrderId, paymentId, signature, secret)) return NextResponse.json({ success: false, error: "Invalid payment proof" }, { status: 400 });
    const result = await settleCapturedPayment(gatewayOrderId, paymentId, userId);
    return NextResponse.json({ success: true, orderId: result.id, orderNumber: result.orderNumber, requiresSupport: result.orderStatus === "PAYMENT_REVIEW" });
  } catch { return NextResponse.json({ success: false, error: "Payment could not be confirmed. If charged, contact support before paying again." }, { status: 400 }); }
}

// Called only after customer payment proof or a signed gateway webhook has been verified.
export async function settleCapturedPayment(gatewayOrderId: string, paymentId: string, userId?: string) {
  const { api } = gateway();
    const [payment, remoteOrder] = await Promise.all([api.payments.fetch(paymentId), api.orders.fetch(gatewayOrderId)]);
    const order = await prisma.order.findFirst({ where: { id: String(remoteOrder.receipt || ""), ...(userId ? { userId } : {}) }, include: { items: true, payments: true } });
    if (!order || !order.payments.some((p) => p.gatewayTxnId === gatewayOrderId || p.gatewayTxnId === paymentId) || payment.order_id !== gatewayOrderId || payment.currency !== "INR" || Number(payment.amount) !== Math.round(order.totalAmount * 100) || Number(remoteOrder.amount) !== Math.round(order.totalAmount * 100)) throw new Error("Payment does not match this order");
    if (payment.status !== "captured") throw new Error("Payment is awaiting capture");
    const result = await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({ where: { id: order.id, paymentStatus: "PENDING" }, data: { paymentStatus: "SUCCESS", orderStatus: "PROCESSING" } });
      if (claimed.count === 0) {
        const existing = await tx.order.findUniqueOrThrow({ where: { id: order.id } });
        if (existing.paymentStatus !== "SUCCESS") throw new Error("Order requires payment review");
        return existing;
      }
      // A paid order is retained for manual fulfilment if stock changed while payment was in progress.
      let inventoryReview = false;
      for (const item of order.items) {
        const reserved = await tx.product.updateMany({ where: { id: item.productId, isActive: true, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (!reserved.count) inventoryReview = true;
      }
      if (order.couponCode) await tx.coupon.updateMany({ where: { code: order.couponCode }, data: { usageCount: { increment: 1 } } });
      await tx.payment.updateMany({ where: { orderId: order.id, gatewayTxnId: gatewayOrderId, status: "PENDING" }, data: { gatewayTxnId: paymentId, status: "COMPLETED" } });
      return tx.order.update({ where: { id: order.id }, data: { orderStatus: inventoryReview ? "PAYMENT_REVIEW" : "PROCESSING" } });
    });

  return result;
}
