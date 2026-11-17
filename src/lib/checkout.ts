import { getStoreSettings } from "@/lib/store-settings";
import { prisma } from "@/lib/prisma";
import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string, secret: string) {
  if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
export async function quoteCart(items: unknown, couponCode?: unknown) {
  if (!Array.isArray(items) || !items.length || items.length > 50) throw new Error("Cart must contain 1–50 products");
  const ids = new Set<string>();
  const lines = [];
  let subtotalPaise = 0;
  for (const item of items) {
    const id = item?.productId || item?.id;
    if (typeof id !== "string" || ids.has(id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 9) throw new Error("Invalid or duplicate cart item");
    ids.add(id);
    const product = await prisma.product.findFirst({ where: { id, isActive: true } });
    if (!product || product.stock < item.quantity) throw new Error("An item is unavailable or out of stock");
    const pricePaise = Math.round(product.price * 100);
    if (!Number.isSafeInteger(pricePaise) || pricePaise <= 0) throw new Error("Product price unavailable");
    for (const [field, allowed] of [["selectedSize", product.sizes], ["selectedColor", product.colors]] as const) {
      if (allowed.length && !allowed.includes(item[field])) throw new Error(`Choose a valid ${field === "selectedSize" ? "size" : "colour"}`);
    }
    subtotalPaise += pricePaise * item.quantity;
    lines.push({ productId: id, quantity: item.quantity, price: pricePaise / 100, selectedSize: item.selectedSize || null, selectedColor: item.selectedColor || null });
  }
  let discountPaise = 0;
  let coupon: Awaited<ReturnType<typeof prisma.coupon.findFirst>> = null;
  if (couponCode) {
    if (typeof couponCode !== "string" || couponCode.length > 80) throw new Error("Invalid coupon");
    coupon = await prisma.coupon.findFirst({ where: { code: { equals: couponCode.trim(), mode: "insensitive" }, isActive: true } });
    const now = new Date();
    if (!coupon || coupon.validFrom > now || (coupon.validTo && coupon.validTo < now) || (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) || subtotalPaise < Math.round(coupon.minOrderValue * 100)) throw new Error("Coupon is unavailable, expired or minimum order not met");
    discountPaise = coupon.discountType === "PERCENTAGE" ? Math.round(subtotalPaise * coupon.discountValue / 100) : coupon.discountType === "FLAT" ? Math.round(coupon.discountValue * 100) : 0;
    if (coupon.maxDiscount !== null) discountPaise = Math.min(discountPaise, Math.round(coupon.maxDiscount * 100));
    discountPaise = Math.max(0, Math.min(discountPaise, subtotalPaise));
  }
  const settings = await getStoreSettings();
  const shippingPaise = coupon?.discountType === "FREE_SHIPPING" || subtotalPaise >= Math.round(settings.freeShippingThreshold * 100) ? 0 : Math.round(settings.standardDeliveryFee * 100);
  const prepaidDiscountPaise = settings.enablePrepaidDiscount ? Math.min(Math.round(settings.prepaidDiscount * 100), subtotalPaise - discountPaise) : 0;
  discountPaise += prepaidDiscountPaise;
  const totalPaise = subtotalPaise + shippingPaise - discountPaise;
  if (!Number.isSafeInteger(totalPaise) || totalPaise < 100) throw new Error("Invalid payable amount");
  return { lines, subtotalPaise, shippingPaise, discountPaise, totalPaise, coupon };
}
