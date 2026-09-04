import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Fetch Customer Orders
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderIdParam = searchParams.get("orderId");

    // Specific order fetch (GST Invoice / Tracking)
    if (orderIdParam) {
      const singleOrder = await prisma.order.findFirst({
        where: {
          OR: [{ id: orderIdParam }, { orderNumber: orderIdParam }],
        },
        include: {
          address: true,
          payments: true,
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

    const orders = await prisma.order.findMany({
      where: customerId ? { userId: customerId } : {},
      include: {
        address: true,
        payments: true,
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch customer orders";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. POST: Order Place karne se pehle Strict Stock Check
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customerDetails, paymentMethod, totalAmount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart mein items hone zaroori hain" },
        { status: 400 }
      );
    }

    // 🔒 STRICT STOCK VALIDATION: Live stock verification
    for (const item of items) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId || item.id },
        select: { id: true, title: true, stock: true },
      });

      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Product nahi mila` },
          { status: 404 }
        );
      }

      if (dbProduct.stock <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: `"${dbProduct.title}" out of stock ho chuka hai! Payment process nahi ho sakti.`,
          },
          { status: 400 }
        );
      }

      const reqQty = item.quantity || 1;
      if (dbProduct.stock < reqQty) {
        return NextResponse.json(
          {
            success: false,
            error: `"${dbProduct.title}" ke sirf ${dbProduct.stock} unit(s) available hain.`,
          },
          { status: 400 }
        );
      }
    }

    const orderNumber = `CB-${Date.now().toString().slice(-6)}`;
    const parsedAmount = parseFloat(totalAmount) || 0;

    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("customer_id")?.value || null;

    // Stock deduction, Address creation, and Order placement inside transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Stock kam karein
      for (const item of items) {
        const pId = item.productId || item.id;
        const qty = item.quantity || 1;
        await tx.product.update({
          where: { id: pId },
          data: {
            stock: { decrement: qty },
          },
        });
      }

      // 2. Address record create karein (Required by Order model relation)
      const createdAddress = await tx.address.create({
        data: {
          fullName: customerDetails?.name || "Direct Customer",
          phone: customerDetails?.phone || "0000000000",
          street: customerDetails?.address || "Direct Storefront Checkout",
          city: customerDetails?.city || "Local",
          state: customerDetails?.state || "State",
          pincode: customerDetails?.pincode || "000000",
          userId: sessionUserId,
        },
      });

      // 3. Schema-compliant Order create karein
      return await tx.order.create({
        data: {
          orderNumber,
          totalAmount: parsedAmount,
          paymentStatus: "PENDING",
          orderStatus: "PAID",
          addressId: createdAddress.id,
          userId: sessionUserId,
          payments: {
            create: {
              gateway: paymentMethod || "ONLINE",
              gatewayTxnId: `TXN_${Date.now()}_${Math.random().toString(36).slice(-4)}`,
              amount: parsedAmount,
              status: "COMPLETED",
            },
          },
          items: {
            create: items.map((i: any) => ({
              productId: i.productId || i.id,
              quantity: i.quantity || 1,
              price: parseFloat(i.price) || 0,
              selectedSize: i.selectedSize || null,
              selectedColor: i.selectedColor || null,
            })),
          },
        },
        include: {
          items: true,
          address: true,
          payments: true,
        },
      });
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to place order";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}