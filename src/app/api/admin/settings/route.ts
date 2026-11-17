import { NextResponse } from "next/server";
import { writeConfig } from "@/lib/admin-config";
import { getStoreSettings, storeDefaults } from "@/lib/store-settings";
import { numberField } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return NextResponse.json({ success: true, settings: await getStoreSettings() }); }
  catch { return NextResponse.json({ success: false, error: "Unable to load saved settings" }, { status: 503 }); }
}
export async function POST(req: Request) {
  try {
    const body = await req.json(); const previous = await getStoreSettings();
    for (const key of ["storeName", "supportEmail", "supportPhone"] as const) if (body[key] !== undefined && body[key] !== storeDefaults[key]) throw new Error("Business identity is maintained in the verified store configuration");
    if (body.enableCashOnDelivery) throw new Error("COD is not supported by this checkout");
    if (body.enablePrepaidDiscount !== undefined && typeof body.enablePrepaidDiscount !== "boolean") throw new Error("Invalid prepaid discount option");
    const settings = { ...previous, ...storeDefaults,
      standardDeliveryFee: previous.standardDeliveryFee,
      freeShippingThreshold: body.freeShippingThreshold === undefined ? previous.freeShippingThreshold : numberField(body.freeShippingThreshold, "free shipping threshold"),
      prepaidDiscount: body.prepaidDiscount === undefined ? previous.prepaidDiscount : numberField(body.prepaidDiscount, "prepaid discount"),
      enablePrepaidDiscount: body.enablePrepaidDiscount ?? previous.enablePrepaidDiscount,
    };
    await writeConfig("STORE", settings);
    return NextResponse.json({ success: true, settings });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to save settings" }, { status: 400 }); }
}
