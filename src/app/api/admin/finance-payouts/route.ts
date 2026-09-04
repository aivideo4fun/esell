import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Saare live supplier payouts fetch karein
export async function GET() {
  try {
    const payouts = await (prisma as any).supplierPayout.findMany({
      orderBy: { dueDate: "asc" },
    });

    // Agar table empty hai toh initial vendors auto-seed kar sakte hain (optional)
    if (!payouts || payouts.length === 0) {
      return NextResponse.json({ success: true, payouts: [] });
    }

    const formatted = payouts.map((p: any) => ({
      id: p.id,
      payoutId: p.payoutRef,
      vendor: p.vendorName,
      amount: Number(p.settlementAmount),
      bankAccount: p.bankAccount,
      dueDate: new Date(p.dueDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: p.status,
    }));

    return NextResponse.json({ success: true, payouts: formatted });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load payouts";
    return NextResponse.json({ success: false, error: msg, payouts: [] }, { status: 500 });
  }
}

// 2. POST: Mark payout as SETTLED / Create new payout
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payoutId, vendorName, settlementAmount, bankAccount, dueDate } = body;

    // Action: Mark Paid
    if (action === "MARK_PAID") {
      await (prisma as any).supplierPayout.update({
        where: { id: payoutId },
        data: { status: "SETTLED" },
      });

      return NextResponse.json({
        success: true,
        message: "Payout marked as SETTLED successfully!",
      });
    }

    // Action: Add New Supplier Payout
    if (action === "CREATE") {
      const count = await (prisma as any).supplierPayout.count();
      const newPayout = await (prisma as any).supplierPayout.create({
        data: {
          payoutRef: `PO-${300 + count + 1}`,
          vendorName,
          settlementAmount: parseFloat(settlementAmount),
          bankAccount,
          dueDate: new Date(dueDate),
          status: "SCHEDULED",
        },
      });

      return NextResponse.json({
        success: true,
        message: "New supplier settlement scheduled!",
        payout: newPayout,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update payout";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}