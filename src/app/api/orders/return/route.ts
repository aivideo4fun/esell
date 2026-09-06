import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { orderId, reason, comments } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID missing hai." },
        { status: 400 }
      );
    }

    const cleanId = String(orderId).trim();
    const cleanNum = cleanId.replace(/^CB-/i, "");

    // Real Order find karein (by id or orderNumber)
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { orderNumber: cleanId },
          { orderNumber: `CB-${cleanNum}` },
          { orderNumber: cleanNum },
        ],
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order database me nahi mila." },
        { status: 404 }
      );
    }

    const returnNote = `[RETURN_REQUESTED]: ${reason || "Damaged/Defective"}${comments ? ` | Note: ${comments}` : ""} | Date: ${new Date().toLocaleDateString("en-IN")}`;

    // Update status in Prisma
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: "RETURN_REQUESTED",
        trackingUrl: returnNote,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Return request submitted successfully!",
        order: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Return API fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}