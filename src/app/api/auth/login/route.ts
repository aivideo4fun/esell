import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Phone/Email aur Password dono dalna zaroori hai." },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim();
    const cleanPhone = cleanInput.replace(/\D/g, "").slice(-10);

    // Database mein exact match find karein (Email ya Phone se)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput },
          { phone: cleanInput },
          ...(cleanPhone.length === 1 ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    // Agar user nahi mila ya password set nahi hai, toh reject karein
    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "Ye mobile number ya email registered nahi hai. Pehle Sign Up karein." },
        { status: 401 }
      );
    }

    // Strict Password Verification using Bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Galat password! Kripya sahi password dalein." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: { id: user.id, name: user.name, phone: user.phone, email: user.email },
    });

    response.cookies.set("customer_id", user.id, {
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