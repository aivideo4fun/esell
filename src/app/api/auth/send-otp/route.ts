import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { identifier, phone, email, name } = await req.json();
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

    // Also ensure user profile exists or upsert safely with fallback email for phones
    if (target.includes("@")) {
      await prisma.user.upsert({
        where: { email: target },
        update: {},
        create: { email: target, name: name || "Customer", phone: null },
      });
    } else {
      const fallbackEmail = `user_${target}@catchbuddy.local`;
      await prisma.user.upsert({
        where: { phone: target },
        update: {},
        create: { phone: target, email: fallbackEmail, name: name || "Customer" },
      });
    }

    // Fast2SMS integration check (SMS delivery)
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

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your mobile/email",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
