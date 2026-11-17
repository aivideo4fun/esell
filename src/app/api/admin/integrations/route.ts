import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ success: true, integrations: [
    { name: "Database", configured: !!process.env.DATABASE_URL },
    { name: "Session signing", configured: (process.env.JWT_SECRET?.length || 0) >= 32 },
    { name: "Razorpay", configured: !!((process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) && process.env.RAZORPAY_KEY_SECRET) },
    { name: "Payment webhook", configured: !!process.env.RAZORPAY_WEBHOOK_SECRET },
    { name: "Firebase phone authentication", configured: !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) },
    { name: "Brevo email", configured: !!process.env.BREVO_API_KEY },
  ], note: "Configured means environment values exist; live connectivity has not been tested. Secret values are never returned." });
}
