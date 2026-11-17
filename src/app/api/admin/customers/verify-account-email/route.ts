import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ success: false, error: "Use the customer account verification flow" }, { status: 410 }); }
