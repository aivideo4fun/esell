import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// 1. Check if customer is logged in
export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerToken = cookieStore.get("customer_id")?.value;

    if (!customerToken) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: customerToken },
      select: { id: true, name: true, phone: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}

// 2. Instant Customer Login / Register with Mobile Number
export async function POST(req: Request) {
  try {
    const { name, phone, email } = await req.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Valid 10-digit mobile number is required" },
        { status: 400 }
      );
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: phone.trim() },
          ...(email ? [{ email: email.trim() }] : []),
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name?.trim() || "Customer",
          phone: phone.trim(),
          email: email?.trim() || `user_${phone.slice(-6)}@catchbuddy.store`,
        },
      });
    } else if (name && !user.name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    // Set 30 days customer login cookie
    const cookieStore = await cookies();
    cookieStore.set("customer_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Customer Auth Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to authenticate" },
      { status: 500 }
    );
  }
}