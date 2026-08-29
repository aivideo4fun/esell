import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, phone, email, address, city, state, pincode, items, totalAmount } = body;

    // 1. Validate required fields
    if (!fullName || !phone || !address || !city || !pincode || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Please provide all required delivery details and at least one item." },
        { status: 400 }
      );
    }

    // 2. Order ID generation (e.g. CB-849201)
    const orderId = `CB-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderSummary = {
      orderId,
      customer: fullName,
      phone,
      email: email || "N/A",
      deliveryAddress: `${address}, ${city}, ${state} - ${pincode}`,
      totalAmount,
      itemsCount: items.length,
      paymentStatus: "PAID_PREPAID",
      supplierStatus: "PENDING_BAAPSTORE_MANUAL_ENTRY",
      createdAt: new Date().toISOString(),
    };

    console.log("New CatchBuddy Prepaid Order Received:", orderSummary);

    // 3. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully with 100% Prepaid Protection.",
        orderId,
        data: orderSummary,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Could not process order." },
      { status: 500 }
    );
  }
}