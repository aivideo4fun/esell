import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");

    let user = null;

    if (phone || email) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(phone ? [{ phone: phone.replace(/\D/g, "").slice(-10) }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
      });
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: user.id,
        name: user.name,
        email: user.email?.includes("@catchbuddy.store") ? "" : user.email,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    const updatedUser = await prisma.user.updateMany({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: `0${cleanPhone}` },
        ],
      },
      data: {
        name: name?.trim() || undefined,
        ...(email && email.trim() && !email.includes("@catchbuddy.store")
          ? { email: email.trim().toLowerCase() }
          : {}),
      },
    });

    if (email && email.trim()) {
      await prisma.customer.updateMany({
        where: { phone: cleanPhone },
        data: {
          name: name?.trim() || undefined,
          email: email.trim().toLowerCase(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      customer: { name, phone: cleanPhone, email },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}