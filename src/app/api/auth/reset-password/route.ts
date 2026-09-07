import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Temporary in-memory OTP store (Production ke liye Redis ya DB use kar sakte hain)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(req: Request) {
  try {
    const { action, phone, otp, newPassword } = await req.json();
    const cleanPhone = phone?.replace(/\D/g, "").slice(-10);

    if (!cleanPhone) {
      return NextResponse.json({ success: false, error: "Valid phone number is required" }, { status: 400 });
    }

    // STEP 1: Send OTP
    if (action === "SEND_OTP") {
      const user = await prisma.user.findFirst({ where: { phone: cleanPhone } });
      if (!user) {
        return NextResponse.json({ success: false, error: "No account found with this phone number." }, { status: 404 });
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(cleanPhone, {
        otp: generatedOtp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
      });

      // Yahan aap WhatsApp ya SMS gateway integration call kar sakte hain
      console.log(`[DEV OTP] Password Reset OTP for ${cleanPhone}: ${generatedOtp}`);

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully to your registered phone.",
        // Development ke liye response mein OTP bhej rahe hain taaki testing asan ho
        devOtp: generatedOtp 
      });
    }

    // STEP 2: Verify OTP & Reset Password
    if (action === "RESET_PASSWORD") {
      if (!otp || !newPassword) {
        return NextResponse.json({ success: false, error: "OTP and new password are required" }, { status: 400 });
      }

      const storedData = otpStore.get(cleanPhone);
      if (!storedData || storedData.expiresAt < Date.now()) {
        return NextResponse.json({ success: false, error: "OTP expired or invalid. Please request a new one." }, { status: 400 });
      }

      if (storedData.otp !== otp.trim()) {
        return NextResponse.json({ success: false, error: "Incorrect OTP entered." }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.updateMany({
        where: { phone: cleanPhone },
        data: { password: hashedPassword },
      });

      // Clear OTP
      otpStore.delete(cleanPhone);

      return NextResponse.json({ success: true, message: "Password reset successfully. You can now login." });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}