import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { identifier, phone, email } = await req.json();
    const target = (identifier || phone || email || "").trim();

    if (!target || target.length < 5) {
      return NextResponse.json(
        { success: false, error: "Valid mobile number or email required" },
        { status: 400 }
      );
    }

    // 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Purane OTP delete karke naya save karein
    await prisma.verificationOtp.deleteMany({ where: { identifier: target } });
    await prisma.verificationOtp.create({
      data: {
        identifier: target,
        otp,
        expiresAt,
      },
    });

    // Fast2SMS integration check
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    const cleanPhone = target.replace("+91", "").trim();
    const isMobile = /^[0-9]{10}$/.test(cleanPhone);

    if (fast2smsKey && isMobile) {
      try {
        await fetch(
          `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&variables_values=${otp}&route=otp&numbers=${cleanPhone}`
        );
      } catch (smsErr) {
        console.error("SMS Gateway Error:", smsErr);
      }
    }

    console.log(`[OTP SENT] -> Target: ${target} | OTP: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}