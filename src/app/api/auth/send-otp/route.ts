import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { identifier, phone, email, otp, name } = await req.json();
    const target = (identifier || phone || email || "").trim();
    const cleanOtp = (otp || "").trim();

    if (!target || !cleanOtp) {
      return NextResponse.json(
        { success: false, error: "Mobile/Email aur 6-digit OTP dono zaroori hain" },
        { status: 400 }
      );
    }

    // Database se OTP record find karein
    const record = await prisma.verificationOtp.findFirst({
      where: { identifier: target },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: "OTP expired ya invalid hai. Dobara bhejein." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > new Date(record.expiresAt)) {
      await prisma.verificationOtp.deleteMany({ where: { identifier: target } });
      return NextResponse.json(
        { success: false, error: "OTP ki validity samapt ho chuki hai." },
        { status: 400 }
      );
    }

    // Match OTP
    if (record.otp !== cleanOtp) {
      return NextResponse.json(
        { success: false, error: "Galat OTP enter kiya gaya hai." },
        { status: 400 }
      );
    }

    // Verification successful -> Delete used OTP
    await prisma.verificationOtp.deleteMany({ where: { identifier: target } });

    // Handle User creation or login session retrieval if name is provided
    let user = null;
    if (target.includes("@")) {
      user = await prisma.user.upsert({
        where: { email: target },
        update: {},
        create: { email: target, name: name || "Customer" },
      });
    } else {
      user = await prisma.user.upsert({
        where: { phone: target },
        update: {},
        create: { phone: target, name: name || "Customer" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      user,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}