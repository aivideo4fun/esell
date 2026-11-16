import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { settleCapturedPayment } from "@/lib/payment-routes";
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ success: false }, { status: 503 });
  const raw = await req.text();
  if (raw.length > 100000) return NextResponse.json({ success: false }, { status: 413 });
  const signature = req.headers.get("x-razorpay-signature") || "";
  const expected = createHmac("sha256", secret).update(raw).digest();
  if (!/^[a-f0-9]{64}$/i.test(signature) || !timingSafeEqual(expected, Buffer.from(signature, "hex"))) return NextResponse.json({ success: false }, { status: 401 });
  try {
    const event = JSON.parse(raw);
    if (event.event !== "payment.captured") return NextResponse.json({ success: true });
    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id || !payment?.id) return NextResponse.json({ success: false }, { status: 400 });
    await settleCapturedPayment(payment.order_id, payment.id);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false }, { status: 503 }); }
}
