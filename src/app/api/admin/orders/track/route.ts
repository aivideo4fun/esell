import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Database lookup by Order ID or Customer Phone
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: query },
          { customerPhone: query },
          ...(query.length >= 6 ? [{ id: { endsWith: query } }] : []),
        ],
      },
      include: {
        items: true,
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
    const rawStatus = (order.status || "PENDING").toUpperCase();

    // Determine current active step (1 to 5)
    let currentStep = 1;
    if (["CONFIRMED", "PROCESSING"].includes(rawStatus)) currentStep = 2;
    if (["SHIPPED", "DISPATCHED", "IN_TRANSIT"].includes(rawStatus)) currentStep = 3;
    if (["OUT_FOR_DELIVERY"].includes(rawStatus)) currentStep = 4;
    if (["DELIVERED", "COMPLETED"].includes(rawStatus)) currentStep = 5;
    if (["CANCELLED", "REJECTED"].includes(rawStatus)) currentStep = -1;

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: rawStatus,
        currentStep,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        address: order.address || order.city || "India",
        courierName: (order as any).courierName || "CatchBuddy Express Logistics",
        trackingNumber: (order as any).trackingNumber || `CB-${order.id.slice(-6).toUpperCase()}`,
        items: order.items.map((item: any) => ({
          title: item.title || item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || "/placeholder.png",
        })),
      },
    });
  } catch (error: any) {
    console.error("Order tracking fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error fetching order status." },
      { status: 500 }
    );
  }
}