import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ success: false, error: "Cash on Delivery is unavailable. Please use secure online checkout." }, { status: 410 }); }
