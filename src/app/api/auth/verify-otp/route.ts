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

    // Firebase Phone Auth ke baad backend user session upsert/sync karein
    let user = null;
    if (target.includes("@")) {
      user = await prisma.user.upsert({
        where: { email: target },
        update: {},
        create: { email: target, name: name || "Customer" },
      });
    } else {
      user = await prisma.user.upsert({
        where: { phone: target },
        update: {},
        create: { phone: target, name: name || "Customer" },
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