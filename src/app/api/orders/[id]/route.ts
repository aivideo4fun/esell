import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // ID ya OrderNumber dono se search karein
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: id },
          ...(id.startsWith("CB-") || id.startsWith("cb-")
            ? [{ orderNumber: id }, { orderNumber: id.replace(/^CB-/i, "") }]
            : [{ orderNumber: id }]),
        ],
      },
      include: {
        user: true,
        shippingAddress: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, order },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Single order fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order details" },
      { status: 500 }
    );
  }
}