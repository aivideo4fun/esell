import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";

export const dynamic = "force-dynamic";

// In-memory temporary store for OTPs (For production use Redis/DB)
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, phone, otp } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // ACTION 1: SEND OTP
    if (action === "SEND_OTP") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(email, { otp: generatedOtp, expires: Date.now() + 10 * 60 * 1000 }); // 10 mins expiry

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #059669;">CatchBuddy Email Verification</h2>
          <p>Your One-Time Password (OTP) to verify your email address is:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f0fdf4; color: #065f46; padding: 10px 20px; display: inline-block; border-radius: 8px; letter-spacing: 4px;">
            ${generatedOtp}
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">This OTP is valid for 10 minutes. Once verified, your email address will be permanently locked for security.</p>
        </div>
      `;

      const mailRes = await sendBrevoEmail({
        toEmail: email,
        toName: "Valued Customer",
        subject: "Verify Your Email - CatchBuddy",
        htmlContent: emailHtml,
      });

      if (!mailRes.success) {
        return NextResponse.json({ success: false, error: "Failed to dispatch verification email via Brevo" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "OTP sent successfully" });
    }

    // ACTION 2: VERIFY OTP & LOCK PERMANENTLY
    if (action === "VERIFY_OTP") {
      const record = otpStore.get(email);
      if (!record || record.expires < Date.now()) {
        return NextResponse.json({ success: false, error: "OTP expired or invalid" }, { status: 400 });
      }

      if (record.otp !== otp) {
        return NextResponse.json({ success: false, error: "Incorrect OTP entered" }, { status: 400 });
      }

      // Mark email as verified / locked in database
      await prisma.customer.updateMany({
        where: {
          OR: [
            { email: email },
            { phone: phone }
          ]
        },
        data: {
          email: email,
          isEmailVerified: true,
        } as any,
      });

      otpStore.delete(email);
      return NextResponse.json({ success: true, message: "Email successfully verified and locked permanently!" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Verify Email API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}