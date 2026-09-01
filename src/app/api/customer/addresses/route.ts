import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET: Fetch all saved addresses for logged-in user
export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: customerId },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load addresses" },
      { status: 500 }
    );
  }
}

// POST: Add new address
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, street, city, state, pincode, isDefault } = body;

    if (isDefault) {
      // Reset other default addresses
      await prisma.address.updateMany({
        where: { userId: customerId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: customerId,
        fullName,
        phone,
        street,
        city,
        state,
        pincode,
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save address" },
      { status: 500 }
    );
  }
}

// DELETE: Remove address
export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json({ success: false, error: "Missing address ID" }, { status: 400 });
    }

    await prisma.address.delete({
      where: { id: addressId, userId: customerId },
    });

    return NextResponse.json({ success: true, message: "Address deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete address" },
      { status: 500 }
    );
  }
}