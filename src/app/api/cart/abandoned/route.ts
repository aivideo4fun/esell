import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, phone, city, pincode, address, items, totalAmount } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number required" },
        { status: 400 }
      );
    }

    // Customer info create ya update
    try {
      await prisma.customer.upsert({
        where: { phone: phone.trim() },
        update: {
          name: customerName || undefined,
        },
        create: {
          phone: phone.trim(),
          name: customerName || "Guest",
        },
      });
    } catch {}

    // Activity log entry for abandoned session
    try {
      await prisma.activityLog.create({
        data: {
          action: "ABANDONED_CART_SYNC",
          details: JSON.stringify({
            phone,
            name: customerName,
            city,
            pincode,
            address,
            itemCount: Array.isArray(items) ? items.length : 0,
            amount: totalAmount,
          }),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Abandoned cart recorded successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record abandoned cart" },
      { status: 500 }
    );
  }
}