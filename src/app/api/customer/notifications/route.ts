import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user recent orders for automated tracking notifications
    const recentOrders = await prisma.order.findMany({
      where: { userId: customerId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const notifications = [
      {
        id: "promo-welcome",
        title: "Welcome to CatchBuddy!",
        message: "Enjoy flat ₹50 OFF on all prepaid orders directly at checkout.",
        type: "PROMOTION",
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...recentOrders.map((order) => ({
        id: `order-update-${order.id}`,
        title: `Order Status: ${order.orderStatus || "CONFIRMED"}`,
        message: `Your package #${order.orderNumber || order.id.slice(-6).toUpperCase()} is currently in ${order.orderStatus || "PROCESSING"} state.`,
        type: "ORDER",
        createdAt: order.createdAt.toISOString(),
        read: true,
      })),
    ];

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load notifications" },
      { status: 500 }
    );
  }
}