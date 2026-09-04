import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: { in: ["PENDING", "FAILED"] },
      },
      include: {
        items: {
          include: {
            product: {
              select: { title: true, price: true },
            },
          },
        },
        address: true, // ✅ Correct relation from your schema
        user: {
          select: { name: true, email: true, phone: true },
        },
        customer: {
          select: { name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedCarts = orders.map((order) => {
      let productTitles = order.items
        ?.map((item) => item.product?.title)
        .filter(Boolean)
        .join(", ");

      // Fallback: order.shippingAddress ke badle order.address use kiya gaya hai
      if (!productTitles) {
        productTitles =
          order.address?.street ||
          order.address?.city ||
          "Pending Cart Items";
      }

      const diffMs = Date.now() - new Date(order.createdAt).getTime();
      const hoursAgo = Math.floor(diffMs / (1000 * 60 * 60));

      const customerName =
        order.user?.name ||
        order.customer?.name ||
        order.address?.fullName ||
        "Shopper";

      const customerPhone =
        order.user?.phone ||
        order.customer?.phone ||
        order.address?.phone ||
        "";

      const customerEmail =
        order.user?.email ||
        order.customer?.email ||
        "";

      return {
        id: order.id,
        orderNumber: order.orderNumber || order.id.slice(-6).toUpperCase(),
        customerName,
        customerPhone,
        customerEmail,
        productTitles,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        hoursAgo: hoursAgo > 0 ? `${hoursAgo}h ago` : "Just now",
        status: order.orderStatus,
      };
    });

    return NextResponse.json({ success: true, carts: formattedCarts });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load abandoned carts";
    return NextResponse.json({ success: false, error: msg, carts: [] }, { status: 500 });
  }
}