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

    const fullAddressString = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state || "Rajasthan"} - ${shippingAddress.pincode}`;

    // Create Order in Database via Prisma handling Address relation correctly
    const newOrder = await prisma.order.create({
      data: {
        name: shippingAddress.fullName,
        phone: shippingAddress.phone,
        paymentMethod: paymentMethod || "COD",
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
        status: "PLACED",
        totalAmount: Number(totalAmount || 0),
        discount: Number(discount || 0),
        couponCode: couponCode || null,
        // Handling address as a relation or creating it inline based on Prisma schema relation
        address: {
          create: {
            fullName: shippingAddress.fullName,
            phone: shippingAddress.phone,
            street: shippingAddress.street,
            city: shippingAddress.city || "",
            state: shippingAddress.state || "Rajasthan",
            pincode: shippingAddress.pincode || "",
            address: fullAddressString,
          },
        },
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.id || "unknown",
            title: item.title || "Product",
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            image: item.image || "/logo.png",
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      orderId: newOrder.id,
    });
  } catch (error: any) {
    console.error("Place Order API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error while placing order" },
      { status: 500 }
    );
  }
}