import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = Number(body.amount);

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount" },
        { status: 400 }
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Agar real API keys configured nahi hain toh safe test mode chalega
    if (!keyId || !keySecret || keyId.includes("placeholder") || keySecret.includes("secret")) {
      return NextResponse.json({
        success: true,
        orderId: `order_test_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        key: "test_mode",
        isMock: true,
      });
    }

    // Live / Real Razorpay instance
    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: keyId,
      });
    } catch (rzpErr: any) {
      console.warn("Razorpay live init failed, falling back to instant order:", rzpErr?.message);
      return NextResponse.json({
        success: true,
        orderId: `order_auto_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        key: "test_mode",
        isMock: true,
      });
    }
  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}