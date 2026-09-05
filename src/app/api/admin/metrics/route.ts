import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Total Revenue calculation (Successful / Paid orders)
    const paidOrders = await prisma.order.findMany({
      where: {
        paymentStatus: { in: ["PAID", "COMPLETED", "SUCCESS"] },
      },
      select: {
        totalAmount: true,
      },
    });

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + (Number(order.totalAmount) || 0),
      0
    );

    // 2. Prepaid Orders count
    const prepaidOrdersCount = await prisma.order.count({
      where: {
        paymentMethod: { not: "COD" },
        paymentStatus: { in: ["PAID", "COMPLETED", "SUCCESS"] },
      },
    });

    // 3. Pending Dispatch Orders count
    const pendingDispatchCount = await prisma.order.count({
      where: {
        orderStatus: { in: ["PENDING", "PROCESSING", "CONFIRMED"] },
      },
    });

    // 4. Active Catalog Products & Categories count
    const activeProductsCount = await prisma.product.count();
    const categoriesCount = await prisma.category.count();

    return NextResponse.json(
      {
        success: true,
        metrics: {
          totalRevenue,
          prepaidOrdersCount,
          pendingDispatchCount,
          activeProductsCount,
          categoriesCount,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to fetch admin metrics:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load metrics" },
      { status: 500 }
    );
  }
}