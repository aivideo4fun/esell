import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, reason, images } = body;

    if (!orderId || !reason) {
      return NextResponse.json({ success: false, error: "Order ID and reason are required" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      }
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Properly format and store images JSON array
    const imagesArray = Array.isArray(images) ? images : [];
    const imagesJson = JSON.stringify(imagesArray);
    
    // Strict format matching admin parser
    const returnNote = `[RETURN_REQUESTED]: ${reason} | IMAGES_JSON:${imagesJson}`;

    await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        orderStatus: "RETURN_REQUESTED",
        trackingUrl: returnNote,
      } as any,
    });

    return NextResponse.json({ success: true, message: "Return request submitted successfully with photos" });
  } catch (error: any) {
    console.error("Return API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to submit return request" }, { status: 500 });
  }
}