import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/store-settings";
import { writeConfig } from "@/lib/admin-config";
import { numberField } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
export async function GET() {
  const s = await getStoreSettings();
  return NextResponse.json({ success: true, rules: { freeDeliveryMinOrder: s.freeShippingThreshold, standardDeliveryFee: s.standardDeliveryFee, prepaidDiscount: s.enablePrepaidDiscount ? s.prepaidDiscount : 0 } });
}
export async function POST(req: Request) {
  try {
    const b = await req.json(); const s = await getStoreSettings();
    const rules = { freeDeliveryMinOrder: numberField(b.freeDeliveryMinOrder, "free delivery minimum"), standardDeliveryFee: numberField(b.standardDeliveryFee, "delivery fee"), prepaidDiscount: numberField(b.prepaidDiscount, "discount") };
    await writeConfig("STORE", { ...s, freeShippingThreshold: rules.freeDeliveryMinOrder, standardDeliveryFee: rules.standardDeliveryFee, prepaidDiscount: rules.prepaidDiscount, enablePrepaidDiscount: rules.prepaidDiscount > 0 });
    return NextResponse.json({ success: true, rules, message: "Shipping and prepaid rules saved" });
  } catch (e) { return NextResponse.json({ success: false, message: e instanceof Error ? e.message : "Unable to save" }, { status: 400 }); }
}
