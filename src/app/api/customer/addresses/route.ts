import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper to resolve user ID safely with 10-digit format
async function resolveUser(email?: string | null, phone?: string | null) {
  if (!email && !phone) return null;

  const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : null;

  return await prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email: email.trim().toLowerCase() }] : []),
        ...(cleanPhone
          ? [
              { phone: cleanPhone },
              { phone: `0${cleanPhone}` },
              { phone: `+91${cleanPhone}` },
            ]
          : []),
      ],
    },
  });
}

// 1. GET: Fetch current active saved addresses
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    const user = await resolveUser(email, phone);

    if (!user) {
      return NextResponse.json({ success: true, addresses: [] });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// 2. POST: Save new address with Smart Slot Management
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, phone, street, city, state, pincode, userEmail, userPhone } = body;

    if (!fullName || !phone || !street || !city || !pincode) {
      return NextResponse.json(
        { success: false, error: "Please fill all required address fields." },
        { status: 400 }
      );
    }

    const cleanUserPhone = userPhone || phone;
    const user = await resolveUser(userEmail, cleanUserPhone);

    if (user) {
      // Find currently active linked addresses
      const currentAddresses = await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });

      // Agar sach me 5 active addresses hain, toh sabse purane address ko unlink karke naye ke liye space banayein
      if (currentAddresses.length >= 5) {
        const oldestAddress = currentAddresses[0];
        try {
          const linkedOrder = await prisma.order.findFirst({
            where: { addressId: oldestAddress.id },
          });

          if (linkedOrder) {
            await prisma.address.update({
              where: { id: oldestAddress.id },
              data: { userId: null },
            });
          } else {
            await prisma.address.delete({
              where: { id: oldestAddress.id },
            });
          }
        } catch {}
      }
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: user ? user.id : null,
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: (state || "Rajasthan").trim(),
        pincode: pincode.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      address: newAddress,
      message: "Address saved successfully",
    });
  } catch (error: any) {
    console.error("Save address error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save address" },
      { status: 500 }
    );
  }
}

// 3. DELETE: Safe Unlink & Delete
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Address ID required" },
        { status: 400 }
      );
    }

    const linkedOrdersCount = await prisma.order.count({
      where: { addressId: id },
    });

    if (linkedOrdersCount > 0) {
      await prisma.address.update({
        where: { id },
        data: { userId: null },
      });
    } else {
      await prisma.address.delete({
        where: { id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Address removed successfully",
    });
  } catch (error: any) {
    console.error("Address delete error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove address" },
      { status: 500 }
    );
  }
}