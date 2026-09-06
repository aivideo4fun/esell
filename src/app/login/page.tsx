import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, identifier, password, name, email, mobile, otp } = body;

    // 1. LOGIN ACTION (Strict Password Verification)
    if (action === "LOGIN") {
      if (!identifier || !password) {
        return NextResponse.json(
          { success: false, error: "Please provide email/mobile and password" },
          { status: 400 }
        );
      }

      const cleanInput = identifier.trim();
      const cleanPhone = cleanInput.replace(/\D/g, "").slice(-10);

      // User search by email or phone
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanInput.toLowerCase() },
            { phone: cleanInput },
            { phone: cleanPhone },
          ],
        },
      });

      // Agar user nahi mila ya password set nahi hai toh fail karein
      if (!user || !user.password) {
        return NextResponse.json(
          { success: false, error: "Invalid Email/Mobile or Password" },
          { status: 401 }
        );
      }

      // STRICT BCRYPT PASSWORD CHECK (Bina iske koi bhi bypass ho jayega)
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Incorrect password. Please try again." },
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
    }

    // 2. SEND_SIGNUP_OTP ACTION
    if (action === "SEND_SIGNUP_OTP") {
      // Yahan apna OTP dispatch logic rakh sakte hain
      return NextResponse.json({ success: true, message: "OTP sent successfully" });
    }

    // 3. VERIFY_AND_REGISTER ACTION (Hashed Password Saving)
    if (action === "VERIFY_AND_REGISTER") {
      if (!mobile || !password || !name) {
        return NextResponse.json(
          { success: false, error: "All fields are required for registration" },
          { status: 400 }
        );
      }

      const cleanMobile = mobile.replace(/\D/g, "").slice(-10);

      // Check existing user
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ phone: cleanMobile }, { email: email.toLowerCase() }],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "User already exists with this phone or email." },
          { status: 400 }
        );
      }

      // Password Hash (Encryption)
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

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}