import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // 1. Foreign key constraints wale linked tables pehle saaf karein
    await (prisma as any).cartItem?.deleteMany({}).catch(() => {});
    await (prisma as any).orderItem?.deleteMany({}).catch(() => {});
    await (prisma as any).review?.deleteMany({}).catch(() => {});
    await (prisma as any).productImage?.deleteMany({}).catch(() => {});

    // 2. Ab saare demo / purane products remove karein
    const deleted = await prisma.product.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Database cleaned successfully! ${deleted.count} old products removed. Now upload your Excel sheet.`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Cleanup failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}