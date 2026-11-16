import { NextResponse } from "next/server";
import { quoteCart } from "@/lib/checkout";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const quote = await quoteCart(body.items, body.couponCode);
    return NextResponse.json({ success: true, subtotal: quote.subtotalPaise / 100, discount: quote.discountPaise / 100, shipping: quote.shippingPaise / 100, total: quote.totalPaise / 100 });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to calculate total" }, { status: 400 }); }
}
