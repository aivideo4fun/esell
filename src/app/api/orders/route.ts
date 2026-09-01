import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderIdParam = searchParams.get("orderId");

    // Agar direct specific order fetch ho raha ho (GST Invoice ke liye)
    if (orderIdParam) {
      const singleOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { id: orderIdParam },
            { orderNumber: orderIdParam }
          ]
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  title: true,
                  slug: true,
                  images: true,
                },
              },
            },
          },
        },
      });

      if (singleOrder) {
        return NextResponse.json({ success: true, orders: [singleOrder] });
      }
    }

    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    let whereClause = {};
    if (customerId) {
      whereClause = { userId: customerId };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch customer orders" },
      { status: 500 }
    );
  }
}