import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Wo sabhi orders jo PENDING status me hain aur complete nahi hue
    const pendingOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
      },
      include: {
        items: {
          include: {
            product: {
              select: { title: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const carts = pendingOrders.map((order) => {
      let productTitles = order.items.map((i) => i.product?.title).filter(Boolean).join(", ");
      
      // Fallback to shipping address where summary was stored during tracking
      if (!productTitles) {
        productTitles = order.shippingAddress || "Pending Cart Items";
      }

      const diffMs = Date.now() - new Date(order.createdAt).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      const timeAgo =
        diffHours > 0 
          ? `${diffHours} hour${diffHours > 1 ? "s" : ""} ago` 
          : `${diffMinutes > 0 ? diffMinutes : 1} min ago`;

      return {
        id: order.id,
        customerName: order.customerName || "Guest Shopper",
        customerEmail: "Contact on WhatsApp",
        customerPhone: order.customerPhone || "N/A",
        productsSummary: productTitles,
        cartValue: order.totalAmount,
        timeAgo,
        isReminded: Boolean((order as any).isReminded),
      };
    });

    return NextResponse.json({ success: true, carts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load carts";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID required" }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        ...({ isReminded: true } as any),
      },
    });

    return NextResponse.json({ success: true, message: "Reminder status updated" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}