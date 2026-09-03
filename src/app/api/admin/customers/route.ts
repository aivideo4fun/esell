import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Saare customers with metrics fetch karein
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const filter = searchParams.get("filter") || "all"; // all, active, blocked

    // Registered users fetch karein with unke orders
    const users = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            totalAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Metric Calculations
    let totalGMV = 0;
    let activeCount = 0;
    let blockedCount = 0;

    const formattedCustomers = users.map((user) => {
      const orderCount = user.orders?.length || 0;
      const totalSpent = user.orders?.reduce((acc, order) => acc + (order.totalAmount || 0), 0) || 0;
      
      totalGMV += totalSpent;
      const isBlocked = Boolean((user as unknown as { isBlocked?: boolean }).isBlocked);
      
      if (isBlocked) {
        blockedCount++;
      } else {
        activeCount++;
      }

      return {
        id: user.id,
        name: user.name || "Guest Customer",
        email: user.email || "No Email",
        phone: (user as unknown as { phone?: string }).phone || "N/A",
        ordersCount: orderCount,
        totalSpent,
        isBlocked,
        createdAt: user.createdAt,
      };
    });

    // Search aur Status filtering
    const filteredList = formattedCustomers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.includes(search);

      if (!matchesSearch) return false;
      if (filter === "active") return !c.isBlocked;
      if (filter === "blocked") return c.isBlocked;
      return true;
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalCustomers: users.length,
        activeBuyers: activeCount,
        blockedAccounts: blockedCount,
        totalCustomerSpend: totalGMV,
      },
      customers: filteredList,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load customers";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. PATCH: Customer ko Block ya Unblock karein
export async function PATCH(req: Request) {
  try {
    const { customerId, isBlocked } = await req.json();

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Customer ID is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: customerId },
      data: {
        // Agar schema me isBlocked nahi hai to safe metadata fallback
        ...({ isBlocked } as unknown as object),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Customer account ${isBlocked ? "blocked" : "unblocked"} successfully.`,
      user: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}