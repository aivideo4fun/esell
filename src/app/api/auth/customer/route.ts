import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    if (!customerId) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: customerId, name: "Customer", phone: customerId.replace("cust_", "") },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, mobile } = body;
    const cleanPhone = String(phone || mobile || "").trim();
    const cleanName = String(name || "").trim() || "Customer";

    const userId = `cust_${cleanPhone || Date.now()}`;
    const cookieStore = await cookies();
    cookieStore.set("customer_id", userId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: { id: userId, name: cleanName, phone: cleanPhone },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: true });
  }
}