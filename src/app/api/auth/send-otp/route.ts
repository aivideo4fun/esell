import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json(); // identifier can be mobile (10-digit) or email

    if (!identifier || identifier.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Valid mobile number or email required" },
        { status: 400 }
      );
    }

    const cleanTarget = identifier.trim();

    // 1. Generate 6 digit secure numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Set 5 minutes expiry time
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 3. Delete old OTPs for this user and save new one
    await prisma.verificationOtp.deleteMany({
      where: { identifier: cleanTarget },
    });

    await prisma.verificationOtp.create({
      data: {
        identifier: cleanTarget,
        otp: generatedOtp,
        expiresAt,
      },
    });

    // 4. Send OTP via SMS / Email Service
    // In Production: Call Fast2SMS / Msg91 / Twilio for SMS ya Nodemailer / Resend for Email
    // Development me testing ke liye console log karein:
    console.log(`\n============================\n[AUTH OTP for ${cleanTarget}]: ${generatedOtp}\n============================\n`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Testing ke liye Dev mode me OTP return kar rahe hain:
      devOtp: process.env.NODE_ENV === "development" ? generatedOtp : undefined,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate OTP" },
      { status: 500 }
    );
  }
}