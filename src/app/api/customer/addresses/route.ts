import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: customerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load addresses";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, street, city, state, pincode } = body;

    const newAddress = await prisma.address.create({
      data: {
        userId: customerId,
        fullName,
        phone,
        street,
        city,
        state,
        pincode,
      },
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save address";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete address";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}