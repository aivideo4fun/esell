import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, items, totalAmount } = body;

    // Validation: Phone aur cart items hone chahiye
    if (!phone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Incomplete data" }, { status: 400 });
    }

    const cleanPhone = String(phone).trim();
    const cleanName = String(name || "Shopper").trim();
    const cleanEmail = String(email || "").trim();

    // Check karein kya is customer ka already koi recent pending draft order hai
    const existingDraft = await prisma.order.findFirst({
      where: {
        customerPhone: cleanPhone,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    const summaryTitles = items.map((i: any) => i.title || "Product").join(", ");

    if (existingDraft) {
      // Existing draft ko update karein
      await prisma.order.update({
        where: { id: existingDraft.id },
        data: {
          customerName: cleanName,
          customerPhone: cleanPhone,
          totalAmount: parseFloat(totalAmount || 0),
          shippingAddress: summaryTitles,
        },
      });
      return NextResponse.json({ success: true, draftId: existingDraft.id });
    }

    // Naya abandoned/pending order record banayein
    const newDraft = await prisma.order.create({
      data: {
        orderNumber: `AB-${Date.now().toString().slice(-6)}`,
        customerName: cleanName,
        customerPhone: cleanPhone,
        shippingAddress: summaryTitles,
        totalAmount: parseFloat(totalAmount || 0),
        paymentMethod: "PENDING_CHECKOUT",
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
      },
    });

    return NextResponse.json({ success: true, draftId: newDraft.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Tracking failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}