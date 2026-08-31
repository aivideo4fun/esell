import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, mobile } = body;
    const cleanPhone = String(phone || mobile || "").trim();
    const cleanName = String(name || "").trim() || "Customer";

    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid mobile number" },
        { status: 400 }
      );
    }

    const userId = `cust_${cleanPhone}`;
    const cookieStore = await cookies();
    cookieStore.set("customer_id", userId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: userId,
        name: cleanName,
        phone: cleanPhone,
      },
    });
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json({ success: true, user: { name: "Customer" } });
  }
}