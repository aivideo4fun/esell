import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, reason, comments } = body;

    if (!orderId || !reason) {
      return NextResponse.json(
        { success: false, error: "Order ID aur reason required hain." },
        { status: 400 }
      );
    }

    const cleanId = String(orderId).trim();

    // ID ya orderNumber dono se find karein
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { orderNumber: cleanId },
          { orderNumber: `CB-${cleanId.replace(/^CB-/i, "")}` },
          { orderNumber: cleanId.replace(/^CB-/i, "") },
        ],
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order database me nahi mila." },
        { status: 404 }
      );
    }

    // Format return note into trackingUrl or notes safely
    const returnNote = `[RETURN_REQUESTED]: ${reason}${comments ? ` | Note: ${comments}` : ""} | Date: ${new Date().toLocaleDateString("en-IN")}`;

    const updateData: any = {
      orderStatus: "RETURN_REQUESTED",
      trackingUrl: returnNote,
    };

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Return & Refund appeal submit ho gayi hai!",
      order: updated,
    });
  } catch (error: any) {
    console.error("Return appeal API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}