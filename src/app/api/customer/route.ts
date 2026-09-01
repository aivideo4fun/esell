import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// 1. GET: Fetch authenticated customer details
export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load customer profile" },
      { status: 500 }
    );
  }
}

// 2. PUT: Update customer details
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone } = await req.json();

    const updated = await prisma.user.update({
      where: { id: customerId },
      data: { name, phone },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}