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

    const cleanId = id.trim();

    // ID ya orderNumber dono se lookup karein
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { orderNumber: cleanId },
          { orderNumber: `CB-${cleanId.replace(/^CB-/i, "")}` },
          { orderNumber: cleanId.replace(/^CB-/i, "") },
        ],
      },
      include: {
        user: true,
        address: true, // shippingAddress ki jagah address use karein
        payments: true,
        items: {
          include: {
            product: {
              select: {
                title: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order record not found" },
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