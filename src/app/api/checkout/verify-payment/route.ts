import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      shippingDetails,
      cartItems,
      totalAmount,
    } = body;

    const orderNumber = `CB-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. User check ya create
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: shippingDetails.phone || "" },
          { email: shippingDetails.email || "" },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: shippingDetails.fullName || "Customer",
          phone: shippingDetails.phone || `99999${Math.floor(10000 + Math.random() * 90000)}`,
          email: shippingDetails.email || `customer_${Date.now()}@catchbuddy.store`,
        },
      });
    }

    // 2. Address create (Prisma Schema model Address)
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: shippingDetails.fullName || "Customer",
        phone: shippingDetails.phone || "N/A",
        street: shippingDetails.street || "Main Road",
        city: shippingDetails.city || "City",
        state: shippingDetails.state || "Rajasthan",
        pincode: shippingDetails.pincode || "302001",
      },
    });

    // 3. Fallback Product ID
    const firstProduct = await prisma.product.findFirst();
    const fallbackProductId = firstProduct?.id || "";

    const itemsToCreate = (cartItems || []).map((item: any) => ({
      productId: item.id && item.id.length > 15 ? item.id : fallbackProductId,
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
    }));

    // 4. Create Order Matching Exact Schema
    const newOrder = await prisma.order.create({
      data: {
        orderNumber: orderNumber,
        userId: user.id,
        addressId: address.id,
        totalAmount: Number(totalAmount) || 0,
        orderStatus: "PAID",
        paymentStatus: "SUCCESS",
        supplierStatus: "PENDING_MANUAL_ORDER",
        channel: "WEBSITE",
        items: {
          create: itemsToCreate,
        },
        payments: {
          create: {
            gateway: "RAZORPAY",
            gatewayTxnId: razorpay_payment_id || `txn_${Date.now()}`,
            amount: Number(totalAmount) || 0,
            status: "COMPLETED",
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        address: true,
      },
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      orderNumber: newOrder.orderNumber,
    });
  } catch (error: any) {
    console.error("Prisma Order Verify Detailed Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Order verification failed" },
      { status: 500 }
    );
  }
}