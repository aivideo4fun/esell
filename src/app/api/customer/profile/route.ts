import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    if (!email && !phone) {
      return NextResponse.json({ success: false, error: "Identifier required" }, { status: 400 });
    }

    const customer = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email: email.trim().toLowerCase() }] : []),
          ...(phone ? [{ phone: phone.replace(/\D/g, "").slice(-10) }] : []),
        ],
      },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name || "Customer",
        email: customer.email || "",
        phone: customer.phone || "",
        isEmailVerified: !!(customer as any).isEmailVerified,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, isEmailVerified } = body;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    let updatedUser;
    if (existingUser) {
      updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: name || existingUser.name,
          phone: cleanPhone || existingUser.phone,
          ...(typeof isEmailVerified === "boolean" ? { isEmailVerified } : {}),
        },
      });
    } else {
      updatedUser = await prisma.user.create({
        data: {
          email: cleanEmail || `user_${Date.now()}@catchbuddy.in`,
          phone: cleanPhone || "9999999999",
          name: name || "Customer",
          isEmailVerified: !!isEmailVerified,
        },
      });
    }

    return NextResponse.json({ success: true, customer: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}