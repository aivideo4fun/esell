import { NextResponse } from "next/server";
import { randomInt, createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/security/customer";
import { sessionKey } from "@/lib/security/session";
import { rateLimit } from "@/lib/security/rate-limit";
import { sendBrevoEmail } from "@/lib/brevo";
export async function POST(req: Request) {
  try {
    const userId = await getCustomerId();
    if (!userId) return NextResponse.json({ success: false, error: "Please sign in" }, { status: 401 });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });
    const { action, otp } = await req.json();
    const identifier = `email:${userId}`;
    const digest = (code: string) => createHmac("sha256", sessionKey()).update(`${identifier}:${code}`).digest("hex");
    if (!(await rateLimit("email-verification", userId, 10))) return NextResponse.json({ success: false, error: "Please wait before trying again" }, { status: 429 });
    if (action === "SEND_OTP") {
      const code = String(randomInt(100000, 1000000));
      await prisma.verificationOtp.deleteMany({ where: { identifier } });
      await prisma.verificationOtp.create({ data: { identifier, otp: digest(code), expiresAt: new Date(Date.now() + 10 * 60000) } });
      const sent = await sendBrevoEmail({ toEmail: user.email, toName: "Customer", subject: "CatchBuddy email verification", htmlContent: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>` });
      if (!sent.success) {
        await prisma.verificationOtp.deleteMany({ where: { identifier } });
        return NextResponse.json({ success: false, error: "Unable to send verification email" }, { status: 503 });
      }
      return NextResponse.json({ success: true });
    }
    if (action === "VERIFY_OTP" && typeof otp === "string" && /^\d{6}$/.test(otp)) {
      const valid = await prisma.$transaction(async (tx) => {
        const consumed = await tx.verificationOtp.deleteMany({ where: { identifier, otp: digest(otp), expiresAt: { gt: new Date() } } });
        if (!consumed.count) return false;
        await tx.user.update({ where: { id: userId }, data: { isEmailVerified: true } });
        return true;
      });
      return NextResponse.json({ success: valid, ...(valid ? {} : { error: "Invalid or expired code" }) }, { status: valid ? 200 : 400 });
    }
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  } catch { return NextResponse.json({ success: false, error: "Verification unavailable" }, { status: 503 }); }
}
