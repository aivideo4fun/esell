import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, identifier, password, name, email, mobile, otp } = body;

    // 1. Universal Test Credentials Bypass
    const isTestUser =
      (identifier === "user@catchbuddy.com" ||
        identifier === "9876543210" ||
        identifier === "test@catchbuddy.com") &&
      password === "admin123";

    if (action === "LOGIN") {
      if (isTestUser) {
        return NextResponse.json({
          success: true,
          user: {
            id: "usr_test_catchbuddy_01",
            name: "Test Customer",
            email: "user@catchbuddy.com",
            mobile: "9876543210",
            role: "CUSTOMER",
          },
        });
      }

      // Default acceptance for dev passwords >= 6 chars
      if (identifier && password && password.length >= 6) {
        return NextResponse.json({
          success: true,
          user: {
            id: "usr_" + Date.now(),
            name: identifier.includes("@") ? identifier.split("@")[0] : "Customer",
            email: identifier.includes("@") ? identifier : null,
            mobile: !identifier.includes("@") ? identifier : null,
            role: "CUSTOMER",
          },
        });
      }

      return NextResponse.json(
        { success: false, error: "Invalid credentials. Use test user: user@catchbuddy.com / admin123" },
        { status: 401 }
      );
    }

    if (action === "SEND_SIGNUP_OTP") {
      console.log(`\n============================\n[DEV OTP] Mobile: ${mobile} | Code: 123456\n============================\n`);
      return NextResponse.json({ success: true, message: "OTP sent (Use 123456 in dev)" });
    }

    if (action === "VERIFY_AND_REGISTER") {
      if (otp === "123456" || otp.length === 6) {
        return NextResponse.json({
          success: true,
          user: {
            id: "usr_" + Date.now(),
            name: name || "Customer",
            email: email,
            mobile: mobile,
            role: "CUSTOMER",
          },
        });
      }
      return NextResponse.json({ success: false, error: "Invalid OTP. Use 123456" }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}