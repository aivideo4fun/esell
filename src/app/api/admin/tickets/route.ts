import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { textField } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  const rows = await prisma.supportTicket.findMany({ where: email ? { customerEmail: email } : {}, include: { user: { select: { name: true, email: true, phone: true } } }, orderBy: { createdAt: "desc" }, take: 1000 });
  const tickets = rows.map((t) => ({ ...t, customerName: t.customerName || t.user?.name || t.message.match(/\[Customer:\s*([^\]]+)\]/)?.[1] || "Customer", cleanMessage: t.message.replace(/^\[Customer:[^\]]*\]\s*/, "") }));
  return NextResponse.json({ success: true, tickets, counts: { all: tickets.length, open: tickets.filter((t) => t.status === "OPEN").length, inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length, resolved: tickets.filter((t) => t.status === "RESOLVED").length } });
}
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const ticket = await prisma.supportTicket.create({ data: { ticketNumber: `TCK-${randomUUID().slice(0, 12).toUpperCase()}`, subject: textField(b.subject || "General Inquiry", "subject"), message: textField(b.message, "message", 10000), customerName: textField(b.name || b.customerName || "Customer", "name"), customerEmail: b.email || b.customerEmail || null, customerPhone: b.phone || b.customerPhone || null } });
    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unable to create ticket" }, { status: 400 }); }
}
export async function PATCH(req: Request) {
  try {
    const b = await req.json(); const id = textField(b.id || b.ticketId, "ticket ID");
    if (!["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(b.status)) throw new Error("Invalid ticket status");
    const ticket = await prisma.supportTicket.update({ where: { id }, data: { status: b.status, ...(b.adminReply !== undefined ? { adminReply: textField(b.adminReply, "reply", 10000, true) } : {}) } });
    return NextResponse.json({ success: true, ticket });
  } catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unable to update ticket" }, { status: 400 }); }
}
export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ success: false }, { status: 400 });
  // Preserve customer support history rather than destroying it.
  await prisma.supportTicket.update({ where: { id }, data: { status: "CLOSED" } });
  return NextResponse.json({ success: true, message: "Ticket closed; history retained" });
}
