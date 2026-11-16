import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ success: false, error: "Automatic age-based deletion is disabled. Archive selected products from the catalog." }, { status: 409 }); }
