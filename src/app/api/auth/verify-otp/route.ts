import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { identifier, phone, email, otp, name } = await req.json();
    const target = (identifier || phone || email || "").trim();
    const enteredOtp = (otp || "").trim();

    if (!target || !enteredOtp) {
      return NextResponse.json(
        { success: false, error: "Identifier and OTP are required" },
        { status: 400 }
      );
    }

    const record = await prisma.verificationOtp.findFirst({
      where: {
        identifier: target,
        otp: enteredOtp,
      },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Galat OTP code daala hai. Kripya dobara check karein." },
        { status: 400 }
      );
    }

    if (new Date() > record.expiresAt) {
      await prisma.verificationOtp.delete({ where: { id: record.id } });
      return NextResponse.json(
        { success: false, error: "OTP expire ho gaya hai. Dobara OTP mangwayein." },
        { status: 400 }
      );
    }

    // OTP verify hone ke baad record delete
    await prisma.verificationOtp.delete({ where: { id: record.id } });

    const isEmail = target.includes("@");
    const cleanPhone = target.replace("+91", "").trim();

    // Database mein user dhundhein ya create karein
    let user = await prisma.user.findFirst({
      where: isEmail ? { email: target } : { phone: cleanPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name?.trim() || (isEmail ? target.split("@")[0] : `User ${cleanPhone.slice(-4)}`),
          email: isEmail ? target : `customer_${Date.now()}@catchbuddy.store`,
          phone: isEmail ? null : cleanPhone,
          role: "CUSTOMER",
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Verified successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || cleanPhone,
      },
    });

    // Customer Session Cookie (30 Days)
    response.cookies.set("customer_id", user.id, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}