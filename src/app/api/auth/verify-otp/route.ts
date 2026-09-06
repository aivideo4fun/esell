import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { identifier, phone, email, otp, name } = await req.json();
    const rawTarget = (identifier || phone || email || "").trim();
    const enteredOtp = (otp || "").trim();

    if (!rawTarget || !enteredOtp) {
      return NextResponse.json(
        { success: false, error: "Identifier and OTP are required" },
        { status: 400 }
      );
    }

    const isEmail = rawTarget.includes("@");
    const cleanPhone = isEmail ? "" : rawTarget.replace(/\D/g, "").slice(-10);
    const target = isEmail ? rawTarget.toLowerCase() : cleanPhone;

    // Verify OTP record
    const record = await prisma.verificationOtp.findFirst({
      where: {
        OR: [
          { identifier: rawTarget, otp: enteredOtp },
          { identifier: target, otp: enteredOtp },
          ...(cleanPhone ? [{ identifier: `+91${cleanPhone}`, otp: enteredOtp }] : []),
        ],
      },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Galat OTP code daala hai. Kripya dobara check karein." },
        { status: 400 }
      );
    }

    if (new Date() > record.expiresAt) {
      await prisma.verificationOtp.delete({ where: { id: record.id } });
      return NextResponse.json(
        { success: false, error: "OTP expire ho gaya hai. Dobara OTP mangwayein." },
        { status: 400 }
      );
    }

    // OTP verify hone ke baad record delete
    await prisma.verificationOtp.delete({ where: { id: record.id } });

    // Customer Name & Email setup
    const enteredName = name?.trim();
    const fallbackName = isEmail
      ? target.split("@")[0]
      : `Shopper ${cleanPhone.slice(-4)}`;

    const userEmail = isEmail ? target : `${cleanPhone}@catchbuddy.in`;

    // Database mein user dhundhein ya create karein
    let user = await prisma.user.findFirst({
      where: isEmail ? { email: target } : { phone: cleanPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: enteredName || fallbackName,
          email: userEmail,
          phone: isEmail ? null : cleanPhone,
          role: "CUSTOMER",
          isActive: true,
        },
      });
    } else {
      // Agar existing user ka naam default tha aur ab naya naam aaya hai toh update karein
      const needsNameUpdate =
        enteredName &&
        (!user.name || user.name === "Direct Customer" || user.name.startsWith("User "));

      if (needsNameUpdate) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: enteredName,
            isActive: true,
          },
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Verified successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || cleanPhone,
      },
    });

    // Customer Session Cookie (30 Days)
    response.cookies.set("customer_id", user.id, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (error: unknown) {
    console.error("Verify OTP error:", error);
    const msg = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}