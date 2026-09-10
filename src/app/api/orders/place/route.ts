import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shippingAddress, paymentMethod, totalAmount, discount, couponCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart items are required" }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street) {
      return NextResponse.json({ success: false, error: "Complete shipping address is required" }, { status: 400 });
    }

    const isCOD = (paymentMethod || "COD") === "COD";
    const orderNumber = `CB-${Date.now().toString().slice(-8)}`;
    const gatewayTxnId = `TXN_${Date.now()}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: Number(totalAmount || 0),
        discountAmount: Number(discount || 0),
        couponCode: couponCode || null,
        orderStatus: "PROCESSING",
        paymentStatus: isCOD ? "PENDING" : "SUCCESS",

        address: {
          create: {
            fullName: shippingAddress.fullName,
            phone: shippingAddress.phone,
            street: shippingAddress.street,
            city: shippingAddress.city || "",
            state: shippingAddress.state || "Rajasthan",
            pincode: shippingAddress.pincode || "",
          },
        },

        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.id,
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0),
            selectedSize: item.selectedSize || null,
            selectedColor: item.selectedColor || null,
          })),
        },

        payments: {
          create: {
            gateway: isCOD ? "COD" : "RAZORPAY",
            gatewayTxnId,
            amount: Number(totalAmount || 0),
            status: isCOD ? "PENDING" : "COMPLETED",
          },
        },
      },
      include: {
        items: true,
        address: true,
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
    });
  } catch (error: any) {
    console.error("Place Order API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error while placing order" },
      { status: 500 }
    );
  }
}