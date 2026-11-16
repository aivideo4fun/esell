import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Fetch all payments and transactions
export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            orderStatus: true,
            paymentStatus: true,
            customer: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// 2. PATCH: Update Payment Status (e.g. Mark Refunded/Success)
export async function PATCH() {
  return NextResponse.json({ success: false, error: "Payment status is managed by verified gateway callbacks. Use the refund verification screen for processed refunds." }, { status: 409 });
}
