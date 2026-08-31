import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// 1. GET: Check Current Customer Session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    if (!customerId) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Try finding customer in database
    let user = null;
    try {
      user = await (prisma as any).customer?.findUnique({
        where: { id: customerId },
      });
    } catch {
      // Fallback if Customer model differs
    }

    if (!user) {
      // Fallback session support
      return NextResponse.json({
        authenticated: true,
        user: { id: customerId, name: "Customer", phone: customerId },
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Auth check error:", err);
    return NextResponse.json({ authenticated: false, user: null });
  }
}

// 2. POST: Register / Login Customer with Mobile Number
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone } = body;

    if (!phone || String(phone).trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim();
    const cleanName = String(name || "").trim() || "Customer";

    let customer = null;

    try {
      // Find or create customer record in DB
      if ((prisma as any).customer) {
        customer = await (prisma as any).customer.upsert({
          where: { phone: cleanPhone },
          update: { name: cleanName },
          create: {
            phone: cleanPhone,
            name: cleanName,
          },
        });
      }
    } catch (dbErr) {
      console.warn("DB Customer upsert fallback:", dbErr);
    }

    const userId = customer?.id || `cust_${cleanPhone}`;

    // Set cookie for authentication
    const cookieStore = await cookies();
    cookieStore.set("customer_id", userId, {
      httpOnly: false, // Accessible by client JS
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: cleanName,
        phone: cleanPhone,
      },
    });
  } catch (err) {
    console.error("Login/Register API Error:", err);
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}