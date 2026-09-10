import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const filePath = path.join(process.cwd(), "data", "seo-config.json");

// Ensure data directory exists
const ensureDirectory = () => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export async function GET() {
  try {
    ensureDirectory();
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      return NextResponse.json({ success: true, seo: JSON.parse(fileData) });
    }
    return NextResponse.json({
      success: true,
      seo: {
        metaTitle: "CatchBuddy - Premium Lifestyle Gadgets & Smart Accessories",
        metaDescription: "Shop authentic gadgets, fast magnetic chargers, ANC wireless earbuds with flat ₹50 off on prepaid orders and express shipping.",
        keywords: "online shopping, catchbuddy, gadgets, electronic accessories, best offers",
        googleSiteVerification: "google-site-verification-cb-98218",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load SEO" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    ensureDirectory();
    const body = await req.json();
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "SEO settings saved successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to save SEO" }, { status: 500 });
  }
}