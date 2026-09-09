import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, phone, email, name } = body;
    const target = (identifier || phone || email || "").trim();

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Valid mobile number or email required" },
        { status: 400 }
      );
    }

    let user = null;
    const cleanName = (name && typeof name === "string" ? name.trim() : "") || "Customer";

    if (target.includes("@")) {
      const cleanEmail = target.toLowerCase();
      
      // Use findFirst or upsert with error boundary
      user = await prisma.user.upsert({
        where: { email: cleanEmail },
        update: {
          name: cleanName !== "Customer" ? cleanName : undefined,
        },
        create: { 
          email: cleanEmail, 
          name: cleanName,
          phone: null 
        },
      });
    } else {
      // Clean phone number (keep digits only, last 10 digits preferred)
      const cleanPhone = target.replace(/\D/g, "").slice(-10) || target;
      const fallbackEmail = `user_${cleanPhone}@catchbuddy.local`;

      // Safely upsert by phone
      user = await prisma.user.upsert({
        where: { phone: cleanPhone },
        update: {
          name: cleanName !== "Customer" ? cleanName : undefined,
        },
        create: { 
          phone: cleanPhone, 
          email: fallbackEmail, 
          name: cleanName 
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "User session synchronized successfully",
      user,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Sync failed";
    console.error("User Sync API Error:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}