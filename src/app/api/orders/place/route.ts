import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shippingAddress, paymentMethod, totalAmount, discount, couponCode, customerEmail, customerPhone } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart items are required" }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street) {
      return NextResponse.json({ success: false, error: "Complete shipping address is required" }, { status: 400 });
    }

    const isCOD = (paymentMethod || "COD") === "COD";
    
    // Clean 8-digit unique order number e.g. CB-84920184
    const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
    const orderNumber = `CB-${random8}`;
    const gatewayTxnId = `TXN_${Date.now()}`;

    // Find or link user if email exists
    let dbUserId = null;
    const cleanEmail = (customerEmail || shippingAddress.email || "").trim().toLowerCase();
    const cleanPhone = (customerPhone || shippingAddress.phone || "").replace(/\D/g, "").slice(-10);

    if (cleanEmail) {
      let existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            email: cleanEmail,
            phone: cleanPhone || "9999999999",
            name: shippingAddress.fullName || "Customer",
          },
        });
      }
      dbUserId = existingUser.id;
    }

    // 1. Create Address
    const createdAddress = await prisma.address.create({
      data: {
        fullName: shippingAddress.fullName,
        phone: cleanPhone || shippingAddress.phone || "0000000000",
        street: shippingAddress.street,
        city: shippingAddress.city || "Parbatsar",
        state: shippingAddress.state || "Rajasthan",
        pincode: shippingAddress.pincode || "341512",
        userId: dbUserId,
      },
    });

    // 2. Create Order with 8-digit orderNumber
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: Number(totalAmount || 0),
        discountAmount: Number(discount || 0),
        couponCode: couponCode || null,
        orderStatus: "PROCESSING",
        paymentStatus: isCOD ? "PENDING" : "SUCCESS",
        userId: dbUserId,
        addressId: createdAddress.id,

        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.id,
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0),
            selectedSize: item.selectedSize || null,
            selectedColor: item.selectedColor || null,
          })),
        },

        payments: {
          create: {
            gateway: isCOD ? "COD" : "RAZORPAY",
            gatewayTxnId,
            amount: Number(totalAmount || 0),
            status: isCOD ? "PENDING" : "COMPLETED",
          },
        },
      },
      include: {
        items: {
          include: { product: { select: { title: true } } },
        },
        address: true,
      },
    });

    // Send Order Confirmation Email via Brevo API
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "support@catchbuddy.in";

    if (apiKey && cleanEmail) {
      try {
        const itemsListHtml = newOrder.items?.map((item: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${item.product?.title || "Product"} (Qty: ${item.quantity})</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
          </tr>
        `).join("") || "";

        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
          body: JSON.stringify({
            sender: { name: "CatchBuddy", email: senderEmail },
            to: [{ email: cleanEmail }],
            subject: `Order Confirmation #${orderNumber} - CatchBuddy`,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <h2 style="color: #16a34a; margin-top: 0;">Order Confirmed! #${orderNumber}</h2>
                <p>Hi <strong>${shippingAddress.fullName}</strong>,</p>
                <p>Thank you for shopping with CatchBuddy. Your order is being prepared for express delivery.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 5px 0;"><strong>Order Number:</strong> #${orderNumber}</p>
                  <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${Number(totalAmount).toLocaleString("en-IN")}</p>
                  <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod || "COD"}</p>
                </div>
                <h3 style="font-size: 14px; color: #0f172a;">Items Ordered:</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  ${itemsListHtml}
                </table>
                <p style="margin-top: 20px;">You can track your order anytime from <a href="https://catchbuddy.in/orders" style="color: #16a34a; font-weight: bold;">CatchBuddy Orders Dashboard</a>.</p>
                <br/>
                <p>Warm regards,<br/><strong>Team CatchBuddy</strong></p>
              </div>
            `,
          }),
        });
      } catch (mailErr) {
        console.error("Order confirmation email failed:", mailErr);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
    });

    if (dbUserId) {
      response.cookies.set("customer_id", dbUserId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return response;
  } catch (error: any) {
    console.error("Place Order API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error while placing order" },
      { status: 500 }
    );
  }
}