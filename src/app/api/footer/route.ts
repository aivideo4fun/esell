import { NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/admin-config";
import { footerDefaults } from "@/lib/footer-defaults";
import { textField } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return NextResponse.json({ success: true, footer: await readConfig("FOOTER", footerDefaults) }); }
  catch { return NextResponse.json({ success: false, footer: footerDefaults, error: "Saved footer configuration unavailable" }, { status: 503 }); }
}
export async function POST(req: Request) {
  try {
    const b = await req.json(); const config = { ...footerDefaults };
    for (const key of ["aboutText", "copyrightText"] as const) config[key] = textField(b[key], key, 2000, true);
    for (const key of ["shopLinks", "customerLinks", "bottomLinks"] as const) {
      if (!Array.isArray(b[key]) || b[key].length > 20) throw new Error("Use at most 20 links per section");
      config[key] = b[key].map((link: any) => {
        const url = textField(link.url, "link URL", 500); if (!/^\/(?!\/)/.test(url) && !/^https:\/\//.test(url)) throw new Error("Use local paths or HTTPS links");
        return { title: textField(link.title, "link title", 100), url };
      });
    }
    if (!Array.isArray(b.assurancePoints) || b.assurancePoints.length > 10) throw new Error("Use at most 10 assurance points");
    config.assurancePoints = b.assurancePoints.map((v: unknown) => textField(v, "assurance text", 200));
    // The verified support contact remains the owner-supplied number.
    await writeConfig("FOOTER", config);
    return NextResponse.json({ success: true, footer: config });
  } catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unable to save footer" }, { status: 400 }); }
}
