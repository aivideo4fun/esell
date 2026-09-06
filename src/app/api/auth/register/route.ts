import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, phone, email, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: "Phone number aur Password mandatory hain." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          ...(email ? [{ email: email.trim() }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Is number/email se account pehle se bana hai. Login karein." },
        { status: 400 }
      );
    }

    // Secure Hashing (Encryption)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name?.trim() || `User (${cleanPhone.slice(-4)})`,
        phone: cleanPhone,
        email: email?.trim() || `user_${cleanPhone}@catchbuddy.in`,
        password: hashedPassword,
        role: "CUSTOMER",
        isActive: true,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Account successfully create ho gaya!",
      user: { id: newUser.id, name: newUser.name, phone: newUser.phone },
    });

    response.cookies.set("customer_id", newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}