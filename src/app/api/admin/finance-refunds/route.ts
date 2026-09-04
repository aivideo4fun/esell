import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Real database se return/refund/cancelled orders fetch karein
export async function GET() {
  try {
    const orders = await (prisma as any).order.findMany({
      where: {
        OR: [
          { status: { in: ["REFUNDED", "RETURNED", "CANCELLED", "REFUND_PENDING"] } },
          { paymentStatus: { in: ["REFUND_PENDING", "REFUNDED"] } },
        ],
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: true, refunds: [] });
    }

    const refunds = orders.map((order: any, idx: number) => {
      const isCompleted = order.status === "REFUNDED" || order.paymentStatus === "REFUNDED";
      const shortId = order.id ? order.id.slice(-4).toUpperCase() : `${9000 + idx}`;
      
      return {
        id: `RF-${shortId}`,
        orderDbId: order.id,
        orderId: `CB-${shortId}`,
        customer: order.shippingAddress?.fullName || order.user?.name || order.customerName || "Customer",
        amount: Number(order.totalAmount || order.total || 0),
        gateway: order.paymentMethod ? `${order.paymentMethod.toUpperCase()}` : "UPI / Gateway",
        status: isCompleted ? "COMPLETED" : "PENDING",
        date: new Date(order.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    });

    return NextResponse.json({ success: true, refunds });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch refunds";
    return NextResponse.json({ success: false, refunds: [], error: msg }, { status: 500 });
  }
}

// 2. POST: Order ko mark as REFUNDED karein
export async function POST(req: Request) {
  try {
    const { orderDbId } = await req.json();

    if (!orderDbId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    await (prisma as any).order.update({
      where: { id: orderDbId },
      data: {
        status: "REFUNDED",
        paymentStatus: "REFUNDED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Refund released successfully!",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Refund update failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}