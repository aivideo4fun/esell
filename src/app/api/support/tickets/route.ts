import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/security/customer";
export const dynamic = "force-dynamic";
export async function GET() {
  const userId = await getCustomerId();
  if (!userId) return NextResponse.json({ success: false, error: "Please sign in" }, { status: 401 });
  const tickets = await prisma.supportTicket.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ success: true, tickets });
}
export async function POST(req: Request) {
  try {
    const userId = await getCustomerId();
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const email = body.customerEmail || body.email;
    if (!message || message.length > 5000 || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ success: false, error: "Enter a valid email and message" }, { status: 400 });
    const ticket = await prisma.supportTicket.create({ data: {
      ticketNumber: `TCK-${randomUUID().slice(0, 12).toUpperCase()}`, userId,
      subject: String(body.subject || "General Inquiry").slice(0, 200), message,
      customerName: String(body.customerName || body.name || "Customer").slice(0, 100),
      customerEmail: email.trim().toLowerCase(), customerPhone: String(body.customerPhone || body.phone || "").slice(0, 30),
    }, select: { id: true, ticketNumber: true } });
    return NextResponse.json({ success: true, ticket, message: "Support request saved" }, { status: 201 });
  } catch { return NextResponse.json({ success: false, error: "Unable to save support request. Please contact support directly." }, { status: 500 }); }
}
