import { NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/admin-config";
import { homepageDefaults } from "@/lib/store-settings";
import { textField } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ success: true, config: await readConfig("HOMEPAGE", homepageDefaults) }); }
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const config = { badge: textField(b.badge, "badge", 100, true), headingMain: textField(b.headingMain, "heading", 200), headingHighlight: textField(b.headingHighlight, "highlight", 200, true), subtitle: textField(b.subtitle, "subtitle", 400, true), dealIds: [] as string[] };
    if (!Array.isArray(b.dealIds) || b.dealIds.length > 5 || !b.dealIds.every((id: unknown) => typeof id === "string")) throw new Error("Choose up to 5 products");
    config.dealIds = [...new Set<string>(b.dealIds.filter(Boolean))];
    await writeConfig("HOMEPAGE", config);
    return NextResponse.json({ success: true, config });
  } catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unable to save homepage" }, { status: 400 }); }
}
