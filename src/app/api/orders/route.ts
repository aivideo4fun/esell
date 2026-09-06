import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendFreeWhatsAppAlert } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

// 1. GET: Fetch Customer Orders
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderIdParam = searchParams.get("orderId");

    if (orderIdParam) {
      const singleOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { id: orderIdParam },
            { orderNumber: orderIdParam },
            { orderNumber: `CB-${orderIdParam}` },
          ],
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

// 2. POST: Order Placement (Extended Timeout + Fast Execution)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      items,
      customerDetails,
      customer,
      paymentMethod,
      paymentId,
      totalAmount,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart me items hone zaroori hain" },
        { status: 400 }
      );
    }

    const cust = customerDetails || customer || {};
    const rawPhone = cust.phone?.toString().trim() || "";
    const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);
    const custName =
      cust.fullName?.trim() ||
      cust.name?.trim() ||
      (cleanPhone ? `Customer (${cleanPhone.slice(-4)})` : "CatchBuddy Shopper");
    const custEmail = cust.email?.trim() || (cleanPhone ? `${cleanPhone}@catchbuddy.in` : null);

    const cookieStore = await cookies();
    let currentUserId = cookieStore.get("customer_id")?.value || null;

    // Smart User Lookup
    let existingUser = null;
    if (currentUserId) {
      existingUser = await prisma.user.findUnique({ where: { id: currentUserId } });
    }

    if (!existingUser && cleanPhone) {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: cleanPhone },
            { phone: `+91${cleanPhone}` },
            { phone: `0${cleanPhone}` },
            ...(custEmail ? [{ email: custEmail }] : []),
          ],
        },
      });
    }

    if (existingUser) {
      currentUserId = existingUser.id;
      if (
        custName &&
        (!existingUser.name ||
          existingUser.name === "Direct Customer" ||
          existingUser.name === "Registered User" ||
          existingUser.name.startsWith("User "))
      ) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { name: custName, phone: cleanPhone || existingUser.phone },
        });
      }
    } else {
      const newUser = await prisma.user.create({
        data: {
          name: custName,
          phone: cleanPhone || null,
          email: custEmail || `user_${cleanPhone || Date.now()}@catchbuddy.in`,
          role: "CUSTOMER",
          isActive: true,
        },
      });
      currentUserId = newUser.id;
    }

    const orderNumber = `CB-${Date.now().toString().slice(-6)}`;
    const parsedAmount = parseFloat(totalAmount) || 0;
    const isCOD = paymentMethod === "COD";

    // Transaction with 15-second timeout configuration
    const newOrder = await prisma.$transaction(
      async (tx) => {
        // 1. Stock Decrement
        for (const item of items) {
          const pId = item.productId || item.id;
          const qty = item.quantity || 1;
          try {
            await tx.product.update({
              where: { id: pId },
              data: { stock: { decrement: qty } },
            });
          } catch {
            // Agar product stock decrement skip ho sake toh gracefully continue karein
          }
        }

        // 2. Address Creation
        const createdAddress = await tx.address.create({
          data: {
            fullName: custName,
            phone: cleanPhone || "0000000000",
            street: cust.street || cust.address || cust.addressLine1 || "Local Delivery",
            city: cust.city || "Jaipur",
            state: cust.state || "Rajasthan",
            pincode: cust.pincode || "302020",
            userId: currentUserId,
          },
        });

        // 3. Order Creation
        return await tx.order.create({
          data: {
            orderNumber,
            totalAmount: parsedAmount,
            paymentStatus: isCOD ? "PENDING" : "SUCCESS",
            orderStatus: "PROCESSING",
            addressId: createdAddress.id,
            userId: currentUserId,
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
          include: {
            items: true,
            address: true,
            payments: true,
          },
        });
      },
      {
        maxWait: 15000, // 15 seconds wait time
        timeout: 15000, // 15 seconds execution time
      }
    );

    // WhatsApp Alert (Background trigger)
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

    return NextResponse.json({
      success: true,
      order: newOrder,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
    });
  } catch (error: unknown) {
    console.error("Order creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to place order";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}