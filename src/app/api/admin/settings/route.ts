import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory / Default configuration fallback
let storeConfig = {
  storeName: "CatchBuddy",
  supportEmail: "support@catchbuddy.com",
  supportPhone: "+91 9876543210",
  currency: "INR",
  freeShippingThreshold: 0,
  prepaidDiscount: 50,
  enablePrepaidDiscount: true,
  enableCashOnDelivery: false,
};

// 1. GET: Fetch store configuration
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      settings: storeConfig,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

// 2. POST: Update store configuration
export async function POST(req: Request) {
  try {
    const body = await req.json();
    storeConfig = {
      ...storeConfig,
      ...body,
    };

    return NextResponse.json({
      success: true,
      message: "Store settings updated successfully",
      settings: storeConfig,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}