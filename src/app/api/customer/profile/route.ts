import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Real customer data from Database
export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    let customer = null;

    if (customerId) {
      customer = await (prisma as any).user.findUnique({
        where: { id: customerId },
        select: { id: true, name: true, email: true, phone: true },
      });
    }

    // Fallback: Agar cookie nahi hai, latest customer uthayein (ya jo email session me ho)
    if (!customer) {
      customer = await (prisma as any).user.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, phone: true },
      });
    }

    if (!customer) {
      return NextResponse.json({ success: false, error: "No customer found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name || customer.email.split("@")[0],
        email: customer.email,
        phone: customer.phone || "", // Real phone only, NO dummy fallback
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load profile";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// 2. PUT: Save actual Name and Phone to Database
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { name, phone } = body;

    const cookieStore = await cookies();
    const customerId = cookieStore.get("customer_id")?.value;

    let targetUser = null;
    if (customerId) {
      targetUser = await (prisma as any).user.findUnique({ where: { id: customerId } });
    }
    if (!targetUser) {
      targetUser = await (prisma as any).user.findFirst({ orderBy: { createdAt: "desc" } });
    }

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const updated = await (prisma as any).user.update({
      where: { id: targetUser.id },
      data: {
        name: name?.trim(),
        phone: phone?.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || "",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}