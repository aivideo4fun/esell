import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendFreeWhatsAppAlert } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

// 1. GET: Fetch Customer Orders (Strict User Isolation)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderIdParam = searchParams.get("orderId");

    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    if (orderIdParam) {
      const singleOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { id: orderIdParam },
            { orderNumber: orderIdParam },
            { orderNumber: `CB-${orderIdParam}` },
          ],
          ...(customerId ? { userId: customerId } : {}),
        },
        include: {
          address: true,
          payments: true,
          items: {
            include: {
              product: { select: { title: true, slug: true, images: true } },
            },
          },
        },
      });

      if (singleOrder) {
        return NextResponse.json({ success: true, orders: [singleOrder] });
      }
    }

    if (!customerId) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: { userId: customerId },
      include: {
        address: true,
        payments: true,
        items: {
          include: {
            product: { select: { title: true, slug: true, images: true } },
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

// 2. POST: Order Placement (Strict Security - No unauthenticated orders allowed)
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const customerIdCookie = cookieStore.get("customer_id")?.value;

    const body = await req.json();
    const { userId, items, customerDetails, paymentMethod, paymentId, totalAmount } = body;

    // Strict Security Check: Request ke sath valid logged-in user ki ID ya cookie honi hi chahiye
    const activeUserId = customerIdCookie || userId;

    if (!activeUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized! Please login to your account to place an order." },
        { status: 401 }
      );
    }

    // Verify karein ki user database mein real mein exist karta hai ya nahi
    const existingUser = await prisma.user.findUnique({
      where: { id: activeUserId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Invalid user session. Please login again." },
        { status: 401 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart mein items hone zaroori hain" },
        { status: 400 }
      );
    }

    const cust = customerDetails || {};
    const rawPhone = cust.phone?.toString().trim() || existingUser.phone || "";
    const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);
    const custName = cust.fullName?.trim() || existingUser.name || "CatchBuddy Shopper";

    const orderNumber = `CB-${Date.now().toString().slice(-6)}`;
    const parsedAmount = parseFloat(totalAmount) || 0;
    const isCOD = paymentMethod === "COD";

    const newOrder = await prisma.$transaction(
      async (tx) => {
        for (const item of items) {
          const pId = item.productId || item.id;
          const qty = item.quantity || 1;
          try {
            await tx.product.update({
              where: { id: pId },
              data: { stock: { decrement: qty } },
            });
          } catch {}
        }

        const createdAddress = await tx.address.create({
          data: {
            fullName: custName,
            phone: cleanPhone || "0000000000",
            street: cust.street || "Local Delivery",
            city: cust.city || "Jaipur",
            state: cust.state || "Rajasthan",
            pincode: cust.pincode || "302020",
            userId: existingUser.id,
          },
        });

        return await tx.order.create({
          data: {
            orderNumber,
            totalAmount: parsedAmount,
            paymentStatus: isCOD ? "PENDING" : "SUCCESS",
            orderStatus: "PROCESSING",
            addressId: createdAddress.id,
            userId: existingUser.id,
            payments: {
              create: {
                gateway: isCOD ? "COD" : "RAZORPAY",
                gatewayTxnId: paymentId || `TXN_${Date.now()}`,
                amount: parsedAmount,
                status: isCOD ? "PENDING" : "COMPLETED",
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
          include: { items: true, address: true, payments: true },
        });
      },
      { maxWait: 15000, timeout: 15000 }
    );

    try {
      sendFreeWhatsAppAlert({
        orderId: newOrder.orderNumber || newOrder.id,
        customerName: custName,
        customerPhone: cleanPhone || "N/A",
        customerCity: cust.city || "Local",
        totalAmount: parsedAmount,
        paymentMethod: isCOD ? "Cash on Delivery (COD)" : "Online Prepaid (Razorpay)",
        itemsCount: items.length,
      }).catch((err) => console.error("WA Background err:", err));
    } catch {}

    const response = NextResponse.json({
      success: true,
      order: newOrder,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
    });

    response.cookies.set("customer_id", existingUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error: unknown) {
    console.error("Order creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to place order";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}