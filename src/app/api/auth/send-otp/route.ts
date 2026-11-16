import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ success: false, error: "Use SMS verification on the login page" }, { status: 410 }); }
