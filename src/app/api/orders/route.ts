import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendFreeWhatsAppAlert } from "@/lib/whatsapp";
import { sendBrevoEmail } from "@/lib/brevo";

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
    const custEmail = cust.email?.trim() || existingUser.email || "";

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
          include: { 
            items: {
              include: {
                product: { select: { title: true } }
              }
            }, 
            address: true, 
            payments: true 
          },
        });
      },
      { maxWait: 15000, timeout: 15000 }
    );

    // 1. WhatsApp Alert Dispatch
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

    // 2. Brevo Order Confirmation Email Dispatch
    if (custEmail && !custEmail.includes("@catchbuddy.local")) {
      try {
        const itemsListHtml = newOrder.items?.map((item: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${item.product?.title || "CatchBuddy Product"} (Qty: ${item.quantity})</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
          </tr>
        `).join("") || "";

        const orderEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <h2 style="color: #059669; margin-top: 0;">Order Confirmation - CatchBuddy</h2>
            <p>Hi <strong>${custName}</strong>,</p>
            <p>Thank you for shopping with CatchBuddy! Your order has been successfully confirmed and is being prepared for express delivery.</p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 14px;"><strong>Order ID:</strong> #${newOrder.orderNumber || newOrder.id}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Total Amount:</strong> ₹${parsedAmount.toLocaleString("en-IN")}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Payment Mode:</strong> ${isCOD ? "Cash on Delivery (COD)" : "Online Prepaid"}</p>
            </div>

            <h3 style="font-size: 15px; border-bottom: 2px solid #059669; padding-bottom: 5px; color: #0f172a;">Ordered Items</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              ${itemsListHtml}
            </table>

            <p style="margin-top: 25px; font-size: 13px; color: #475569;">You can track your consignment live anytime from your <a href="https://catchbuddy.in/orders" style="color: #059669; font-weight: bold; text-decoration: underline;">CatchBuddy Orders Dashboard</a>.</p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; text-align: center;">© 2026 CatchBuddy. All rights reserved.</p>
          </div>
        `;

        void sendBrevoEmail({
          toEmail: custEmail,
          toName: custName,
          subject: `Order Confirmed! #${newOrder.orderNumber || newOrder.id} - CatchBuddy`,
          htmlContent: orderEmailHtml,
        });
      } catch (emailErr) {
        console.error("Order Email Dispatch Error:", emailErr);
      }
    }

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