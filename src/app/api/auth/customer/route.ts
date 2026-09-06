import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Temporary in-memory store for reset OTPs (Production ke liye DB ya Redis use kar sakte hain)
const resetOtpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, identifier, password, name, email, mobile, otp, newPassword } = body;

    // 1. LOGIN ACTION
    if (action === "LOGIN") {
      if (!identifier || !password) {
        return NextResponse.json({ success: false, error: "Please provide email/mobile and password" }, { status: 400 });
      }

      const cleanInput = identifier.trim();
      const cleanPhone = cleanInput.replace(/\D/g, "").slice(-10);

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanInput.toLowerCase() },
            { phone: cleanInput },
            { phone: cleanPhone },
          ],
        },
      });

      if (!user || !user.password) {
        return NextResponse.json({ success: false, error: "Invalid Email/Mobile or Password" }, { status: 401 });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ success: false, error: "Incorrect password. Please try again." }, { status: 401 });
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
    }

    // 2. SEND_SIGNUP_OTP ACTION
    if (action === "SEND_SIGNUP_OTP") {
      return NextResponse.json({ success: true, message: "OTP sent successfully" });
    }

    // 3. VERIFY_AND_REGISTER ACTION
    if (action === "VERIFY_AND_REGISTER") {
      if (!mobile || !password || !name) {
        return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
      }

      const cleanMobile = mobile.replace(/\D/g, "").slice(-10);
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ phone: cleanMobile }, { email: email.toLowerCase() }] },
      });

      if (existingUser) {
        return NextResponse.json({ success: false, error: "User already exists with this phone or email." }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          phone: cleanMobile,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: "CUSTOMER",
          isActive: true,
        },
      });

      const response = NextResponse.json({
        success: true,
        message: "Account created successfully",
        user: { id: newUser.id, name: newUser.name, phone: newUser.phone, email: newUser.email },
      });

      response.cookies.set("customer_id", newUser.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });

      return response;
    }

    // 4. FORGOT_PASSWORD_REQUEST ACTION
    if (action === "FORGOT_PASSWORD_REQUEST") {
      const cleanMobile = mobile?.replace(/\D/g, "").slice(-10);
      if (!cleanMobile) {
        return NextResponse.json({ success: false, error: "Valid mobile number is required" }, { status: 400 });
      }

      const user = await prisma.user.findFirst({ where: { phone: cleanMobile } });
      if (!user) {
        return NextResponse.json({ success: false, error: "No account found with this mobile number." }, { status: 404 });
      }

      // Generate 6-digit OTP (Development ke liye default "123456" ya random rakh sakte hain)
      const generatedOtp = "123456"; 
      resetOtpStore.set(cleanMobile, {
        otp: generatedOtp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
      });

      return NextResponse.json({ success: true, message: "Reset OTP sent successfully" });
    }

    // 5. FORGOT_PASSWORD_RESET ACTION
    if (action === "FORGOT_PASSWORD_RESET") {
      const cleanMobile = mobile?.replace(/\D/g, "").slice(-10);
      if (!cleanMobile || !otp || !newPassword) {
        return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
      }

      const storedData = resetOtpStore.get(cleanMobile);
      if (!storedData || storedData.expiresAt < Date.now()) {
        return NextResponse.json({ success: false, error: "OTP expired or invalid. Request a new one." }, { status: 400 });
      }

      if (storedData.otp !== otp.trim()) {
        return NextResponse.json({ success: false, error: "Incorrect OTP entered." }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.updateMany({
        where: { phone: cleanMobile },
        data: { password: hashedPassword },
      });

      resetOtpStore.delete(cleanMobile);

      return NextResponse.json({ success: true, message: "Password reset successfully!" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}