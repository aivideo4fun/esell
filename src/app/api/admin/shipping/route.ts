import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Default shipping rules
const DEFAULT_RULES = {
  freeDeliveryMinOrder: 999,
  standardDeliveryFee: 60,
  prepaidDiscount: 50,
};

export async function GET() {
  try {
    // Database me system settings ya single setting record check karein
    let config = await (prisma as any).siteConfig?.findFirst({
      where: { key: "shipping_rules" },
    });

    if (config && config.value) {
      const parsed = JSON.parse(config.value);
      return NextResponse.json({ success: true, rules: parsed });
    }

    return NextResponse.json({ success: true, rules: DEFAULT_RULES });
  } catch (err: any) {
    return NextResponse.json({ success: true, rules: DEFAULT_RULES });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { freeDeliveryMinOrder, standardDeliveryFee, prepaidDiscount } = body;

    const newRules = {
      freeDeliveryMinOrder: Number(freeDeliveryMinOrder) || 999,
      standardDeliveryFee: Number(standardDeliveryFee) || 60,
      prepaidDiscount: Number(prepaidDiscount) || 50,
    };

    if ((prisma as any).siteConfig) {
      await (prisma as any).siteConfig.upsert({
        where: { key: "shipping_rules" },
        update: { value: JSON.stringify(newRules) },
        create: { key: "shipping_rules", value: JSON.stringify(newRules) },
      });
    }

    return NextResponse.json({ success: true, rules: newRules, message: "Shipping rules updated successfully!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}