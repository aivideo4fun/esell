import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Fetch all customers with their order history & total spend
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            orderStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedCustomers = customers.map((c) => {
      const totalSpent = c.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return {
        id: c.id,
        name: c.name || "Guest Shopper",
        phone: c.phone || "—",
        email: c.email || "—",
        isBlocked: c.isBlocked,
        orderCount: c.orders.length,
        totalSpent,
        joinedAt: c.createdAt,
        lastOrder: c.orders[0]?.createdAt || null,
      };
    });

    return NextResponse.json({ success: true, customers: formattedCustomers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// 2. PATCH: Block / Unblock customer
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isBlocked } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Customer ID required" },
        { status: 400 }
      );
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: { isBlocked },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update customer status" },
      { status: 500 }
    );
  }
}