import { validateOrderTransition } from "@/lib/admin-validation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        address: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        orders,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, orderStatus, supplierStatus, trackingNumber, trackingUrl } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    if (orderStatus) {
      try { validateOrderTransition(existing.orderStatus, orderStatus, existing.paymentStatus); }
      catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Invalid order transition" }, { status: 409 }); }
    }
    if (trackingUrl && !/^https:\/\//.test(trackingUrl)) return NextResponse.json({ success: false, error: "Tracking link must use HTTPS" }, { status: 400 });
    if (orderStatus === "SHIPPED" && !(trackingNumber || existing.trackingNumber)) return NextResponse.json({ success: false, error: "Add an AWB/tracking number before marking shipped" }, { status: 400 });
    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (supplierStatus) updateData.supplierStatus = supplierStatus;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber ? trackingNumber.trim() : null;
    if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl ? trackingUrl.trim() : null;

    const claimed = await prisma.order.updateMany({ where: { id: orderId, orderStatus: existing.orderStatus, paymentStatus: existing.paymentStatus }, data: updateData });
    if (!claimed.count) return NextResponse.json({ success: false, error: "Order changed while you were editing it. Refresh and retry." }, { status: 409 });
    const updatedOrder = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } }, address: true } });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update order" },
      { status: 500 }
    );
  }
}