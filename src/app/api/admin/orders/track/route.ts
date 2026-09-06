import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Order ID or Phone number is required" },
        { status: 400 }
      );
    }

    // Database lookup by Order ID, Order Number or Customer Phone/Address relation
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: query },
          { orderNumber: query },
          { address: { phone: { contains: query } } },
          ...(query.length >= 6 ? [{ id: { endsWith: query } }] : []),
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                images: true,
              },
            },
          },
        },
        address: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "No active order found with these details." },
        { status: 404 }
      );
    }

    // Map order status to timeline steps
    const rawStatus = (order.orderStatus || "PROCESSING").toUpperCase();

    // Determine current active step (1 to 5)
    let currentStep = 1;
    if (["CONFIRMED", "PROCESSING", "PAID"].includes(rawStatus)) currentStep = 2;
    if (["SHIPPED", "DISPATCHED", "IN_TRANSIT"].includes(rawStatus)) currentStep = 3;
    if (["OUT_FOR_DELIVERY"].includes(rawStatus)) currentStep = 4;
    if (["DELIVERED", "COMPLETED"].includes(rawStatus)) currentStep = 5;
    if (["CANCELLED", "REJECTED"].includes(rawStatus)) currentStep = -1;

    // Safely format address and customer info from relations
    const fullAddress = order.address
      ? `${order.address.street || ""}, ${order.address.city || ""}, ${order.address.state || ""} - ${order.address.pincode || ""}`
      : "India";

    const paymentGateway = order.payments?.[0]?.gateway || "ONLINE";

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: rawStatus,
        currentStep,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        totalAmount: order.totalAmount,
        paymentMethod: paymentGateway,
        customerName: order.address?.fullName || "CatchBuddy Shopper",
        customerPhone: order.address?.phone || "N/A",
        address: fullAddress,
        courierName: (order as any).courierName || "CatchBuddy Express Logistics",
        trackingNumber: (order as any).trackingNumber || `CB-${order.id.slice(-6).toUpperCase()}`,
        items: order.items.map((item: any) => {
          const img =
            item.product?.images?.[0]?.url ||
            item.image ||
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80";
          return {
            title: item.product?.title || item.title || item.name || "CatchBuddy Product",
            quantity: item.quantity,
            price: item.price,
            image: img,
          };
        }),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    console.error("Order tracking fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error fetching order status.", error: msg },
      { status: 500 }
    );
  }
}