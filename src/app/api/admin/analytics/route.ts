import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const paidOrders = orders.filter(
      (o) => o.paymentStatus === "SUCCESS" || o.orderStatus === "PAID" || o.orderStatus === "DELIVERED"
    );

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrdersCount = orders.length;
    const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // 1. Top Selling Products
    const productSalesMap: { [key: string]: { title: string; count: number; revenue: number } } = {};
    orders.forEach((o) => {
      o.orderItems.forEach((item) => {
        const pId = item.productId;
        const pTitle = item.product?.title || "Unknown Product";
        if (!productSalesMap[pId]) {
          productSalesMap[pId] = { title: pTitle, count: 0, revenue: 0 };
        }
        productSalesMap[pId].count += item.quantity;
        productSalesMap[pId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 2. Category Performance
    const categoryMap: { [key: string]: number } = {};
    orders.forEach((o) => {
      o.orderItems.forEach((item) => {
        const catName = item.product?.category?.name || "General";
        categoryMap[catName] = (categoryMap[catName] || 0) + item.price * item.quantity;
      });
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrdersCount,
        paidOrdersCount: paidOrders.length,
        averageOrderValue,
        topProducts,
        categoryBreakdown,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to compile analytics" },
      { status: 500 }
    );
  }
}
