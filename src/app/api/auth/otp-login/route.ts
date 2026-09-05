import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { phone, name } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    // 1. User table check / create
    let user = await prisma.user.findFirst({
      where: { phone: cleanPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          name: name?.trim() || "Customer",
          email: `${cleanPhone}@catchbuddy.store`,
          role: "CUSTOMER",
        },
      });
    }

    // 2. Customer table sync (Quick checkout)
    await prisma.customer.upsert({
      where: { phone: cleanPhone },
      update: { name: name?.trim() || user.name },
      create: { phone: cleanPhone, name: name?.trim() || user.name },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
      },
    });

    // 3. Set persistent cookie
    response.cookies.set("customer_id", user.id, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    console.error("OTP login sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync user" },
      { status: 500 }
    );
  }
}