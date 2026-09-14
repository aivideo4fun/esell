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
    
    // Generate clean 8-digit unique order number e.g. CB-84920184
    const random8 = Math.floor(10000000 + Math.random() * 90000000).toString();
    const orderNumber = `CB-${random8}`;
    const gatewayTxnId = `TXN_${Date.now()}`;

    // Find or link user if email exists
    let dbUserId = null;
    const cleanEmail = (customerEmail || shippingAddress.email || "").trim().toLowerCase();
    const cleanPhone = (customerPhone || shippingAddress.phone || "").replace(/\D/g, "").slice(-10);

    if (cleanEmail) {
      const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingUser) {
        dbUserId = existingUser.id;
      }
    }

    // 1. Pehle Address create karein taaki addressId mil sake (TypeScript relation error fix karne ke liye)
    const createdAddress = await prisma.address.create({
      data: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city || "",
        state: shippingAddress.state || "Rajasthan",
        pincode: shippingAddress.pincode || "",
        userId: dbUserId,
      },
    });

    // 2. Ab Order create karein addressId ke sath
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: Number(totalAmount || 0),
        discountAmount: Number(discount || 0),
        couponCode: couponCode || null,
        orderStatus: "PROCESSING",
        paymentStatus: isCOD ? "PENDING" : "SUCCESS",
        userId: dbUserId, // Linking user so /orders page can fetch it instantly
        addressId: createdAddress.id, // Using foreign key relation correctly

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
        items: true,
        address: true,
      },
    });

    // Send Order Confirmation Email via Brevo API
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "support@catchbuddy.in";

    if (apiKey && cleanEmail) {
      try {
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
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #16a34a;">Order Placed Successfully!</h2>
                <p>Hi <strong>${shippingAddress.fullName}</strong>,</p>
                <p>Thank you for shopping with CatchBuddy. Your order has been successfully placed.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
                  <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${totalAmount}</p>
                  <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod || "COD"}</p>
                </div>
                <p>You can track your order anytime from your CatchBuddy account.</p>
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

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
    });
  } catch (error: any) {
    console.error("Place Order API Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error while placing order" },
      { status: 500 }
    );
  }
}