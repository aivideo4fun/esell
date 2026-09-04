import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        payments: {
          select: { gateway: true },
          take: 1,
        },
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidOrders = orders.filter((o) => o.paymentStatus === "PAID" || o.orderStatus === "DELIVERED");
    const netMargin = Math.round(totalRevenue * 0.28); // Standard e-commerce 28% margin estimate

    // Live refunds data derived from CANCELLED/REFUNDED orders
    const refunds = orders
      .filter((o) => o.orderStatus === "CANCELLED" || o.paymentStatus === "REFUNDED")
      .map((o) => ({
        id: `RF-${o.id.slice(-6).toUpperCase()}`,
        orderId: o.orderNumber || o.id.slice(-6).toUpperCase(),
        customer: o.user?.name || "Direct Customer",
        amount: o.totalAmount,
        gateway: o.payments?.[0]?.gateway || "Razorpay (Online)",
        status: o.paymentStatus === "REFUNDED" ? "COMPLETED" : "PENDING",
        date: new Date(o.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }));

    return NextResponse.json({
      success: true,
      stats: {
        grossGMV: totalRevenue,
        netMargin,
        aov: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
        paidOrdersCount: paidOrders.length,
        totalOrdersCount: orders.length,
      },
      refunds,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load finance data";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}