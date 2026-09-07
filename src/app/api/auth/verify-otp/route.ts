import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { identifier, phone, email, name } = await req.json();
    const target = (identifier || phone || email || "").trim();

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Valid mobile number or email required" },
        { status: 400 }
      );
    }

    let user = null;
    if (target.includes("@")) {
      user = await prisma.user.upsert({
        where: { email: target },
        update: {},
        create: { 
          email: target, 
          name: name || "Customer",
          phone: null 
        },
      });
    } else {
      // Generate a unique fallback email to satisfy Prisma's required email schema field if any
      const fallbackEmail = `user_${target}@catchbuddy.local`;

      user = await prisma.user.upsert({
        where: { phone: target },
        update: {},
        create: { 
          phone: target, 
          email: fallbackEmail, 
          name: name || "Customer" 
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
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}