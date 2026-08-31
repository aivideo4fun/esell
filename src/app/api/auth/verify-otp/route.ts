import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { identifier, otp, name } = await req.json();

    if (!identifier || !otp) {
      return NextResponse.json(
        { success: false, error: "Target identifier and OTP are required" },
        { status: 400 }
      );
    }

    const cleanTarget = identifier.trim();
    const cleanOtp = otp.trim();

    // 1. Verify OTP from Database
    const record = await prisma.verificationOtp.findFirst({
      where: {
        identifier: cleanTarget,
        otp: cleanOtp,
        expiresAt: { gt: new Date() }, // Expiry check
      },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP. Please try again." },
        { status: 400 }
      );
    }

    // 2. Clear used OTP
    await prisma.verificationOtp.deleteMany({
      where: { identifier: cleanTarget },
    });

    // 3. Prevent Duplicate: Check if Customer already exists
    const isEmail = cleanTarget.includes("@");
    let customer = await prisma.customer.findFirst({
      where: isEmail ? { email: cleanTarget } : { phone: cleanTarget },
    });

    // If new customer, create account
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: isEmail ? null : cleanTarget,
          email: isEmail ? cleanTarget : null,
          name: name ? name.trim() : "Verified Customer",
        },
      });
    }

    // 4. Secure Authentication Cookie (prevents multiple login prompts)
    const cookieStore = await cookies();
    cookieStore.set("customer_id", customer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 60, // 60 Days session
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      message: "Customer verified successfully",
      user: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed. Try again." },
      { status: 500 }
    );
  }
}