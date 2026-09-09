import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Type assertion bypasses temporary build worker cache sync issues
    const notifications = await (prisma as any).notification.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

    const notification = await (prisma as any).notification.create({
      data: {
        title,
        message,
        isGlobal: true,
      },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to send broadcast notification" }, { status: 500 });
  }
}