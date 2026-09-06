import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const filter = (searchParams.get("filter") || "all").toLowerCase().trim();

    // 1. Saare Users fetch karein (ADMIN role ko chhodkar sabhi shoppers)
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          role: "ADMIN",
        },
      },
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let totalGMV = 0;
    let activeCount = 0;
    let blockedCount = 0;

    const formattedList = users.map((u) => {
      const orders = u.orders || [];
      const orderCount = u._count?.orders ?? orders.length;
      
      const totalSpent = orders.reduce(
        (sum, ord) => sum + (Number(ord.totalAmount) || 0),
        0
      );

      totalGMV += totalSpent;

      // Status resolution
      const isBlocked = (u as any).isActive === false || Boolean((u as any).isBlocked);
      if (isBlocked) {
        blockedCount++;
      } else {
        activeCount++;
      }

      const rawPhone = u.phone || "";
      const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);

      // Clean name
      let displayName = u.name?.trim();
      if (!displayName || displayName === "Direct Customer" || displayName === "Registered User" || displayName.startsWith("User ")) {
        displayName = cleanPhone ? `Customer (${cleanPhone.slice(-4)})` : "Registered Shopper";
      }

      // Clean email representation
      const isDummyStore = u.email?.includes("@catchbuddy.store");
      const displayEmail = isDummyStore && cleanPhone ? `+91 ${cleanPhone}` : (u.email || "N/A");

      return {
        id: u.id,
        name: displayName,
        email: displayEmail,
        phone: cleanPhone ? `+91 ${cleanPhone}` : (u.phone || "N/A"),
        ordersCount: orderCount,
        totalSpent: totalSpent,
        isBlocked: isBlocked,
        createdAt: u.createdAt,
      };
    });

    // 2. Tab Filter (all, active, blocked)
    const tabFiltered = formattedList.filter((c) => {
      if (filter === "active") return !c.isBlocked;
      if (filter === "blocked") return c.isBlocked;
      return true;
    });

    // 3. Search Filter
    const finalCustomers = tabFiltered.filter((c) => {
      if (!search) return true;
      return (
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.includes(search)
      );
    });

    return NextResponse.json(
      {
        success: true,
        metrics: {
          totalCustomers: formattedList.length,
          activeBuyers: activeCount,
          blockedAccounts: blockedCount,
          totalCustomerSpend: totalGMV,
        },
        customers: finalCustomers,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("CRM GET Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load CRM data" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { customerId, isBlocked } = await req.json();

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Customer ID is required" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: customerId },
      data: {
        isActive: !isBlocked,
        ...({ isBlocked } as any),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Customer account ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to update" }, { status: 500 });
  }
}