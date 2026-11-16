import { NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/admin-config";
import { seoDefaults } from "@/lib/seo-settings";
import { textField } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ success: true, seo: await readConfig("SEO", seoDefaults) }); }
export async function POST(req: Request) {
  try { const b = await req.json(); const seo = { metaTitle: textField(b.metaTitle, "title", 200), metaDescription: textField(b.metaDescription, "description", 600), keywords: textField(b.keywords || "", "keywords", 1000, true), googleSiteVerification: textField(b.googleSiteVerification || "", "verification", 300, true) }; await writeConfig("SEO", seo); return NextResponse.json({ success: true, seo }); }
  catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unable to save SEO" }, { status: 400 }); }
}
