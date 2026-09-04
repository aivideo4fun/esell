import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, items, totalAmount } = body;

    const cleanPhone = phone ? String(phone).trim().replace(/\D/g, "") : "";

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Valid 10-digit mobile number required" },
        { status: 400 }
      );
    }

    // Relation-safe search matching Address, Customer, or User
    const existingDraft = await prisma.order.findFirst({
      where: {
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        OR: [
          { address: { phone: { contains: cleanPhone } } },
          { customer: { phone: { contains: cleanPhone } } },
          { user: { phone: { contains: cleanPhone } } },
        ],
      },
      include: {
        items: true,
        address: true,
      },
    });

    if (existingDraft) {
      return NextResponse.json({
        success: true,
        message: "Cart activity tracked",
        orderId: existingDraft.id,
      });
    }

    // Ensure customer record exists for the phone
    let customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: cleanPhone,
          name: `Shopper ${cleanPhone.slice(-4)}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cart tracking active",
      customerId: customer.id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to track cart";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}