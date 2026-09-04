import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Fetch all real tickets with counts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const role = searchParams.get("role");

    let whereClause: any = {};
    if (role !== "admin" && email) {
      whereClause.customerEmail = email;
    }

    const tickets = await (prisma as any).supportTicket.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const allCount = tickets.length;
    const openCount = tickets.filter((t: any) => t.status === "OPEN").length;
    const inProgressCount = tickets.filter((t: any) => t.status === "IN_PROGRESS").length;
    const resolvedCount = tickets.filter((t: any) => t.status === "RESOLVED").length;

    // Parse clean names and clean messages for all consumers
    const formatted = tickets.map((t: any) => {
      const nameMatch = t.message?.match(/\[Customer:\s*([^\]]+)\]/);
      const extractedName = nameMatch ? nameMatch[1] : null;
      const cleanMessage = t.message?.replace(/\[Customer:\s*[^\]]+\]\n?/, "") || t.message;
      return {
        ...t,
        customerName: extractedName || t.customerName || t.user?.name || "Customer",
        customerPhone: t.customerPhone || t.user?.phone || "",
        customerEmail: t.customerEmail || t.user?.email || "customer@catchbuddy.store",
        cleanMessage,
      };
    });

    return NextResponse.json({
      success: true,
      tickets: formatted,
      counts: {
        all: allCount,
        open: openCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load tickets";
    return NextResponse.json({ success: false, error: msg, tickets: [] }, { status: 500 });
  }
}

// 2. POST: Create Ticket (No 'customerName' argument error)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, name, customerEmail, email, customerPhone, phone, subject, message } = body;

    const actualName = customerName || name || "Customer";
    const actualEmail = customerEmail || email;
    const actualPhone = customerPhone || phone;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const count = await (prisma as any).supportTicket.count();
    const ticketNumber = `TCK-${108 + count + 1}`;

    let userId: string | undefined = undefined;
    if (actualEmail) {
      const existingUser = await (prisma as any).user.findUnique({
        where: { email: actualEmail },
        select: { id: true },
      });
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    const formattedMessage = `[Customer: ${actualName}]\n${message}`;

    const newTicket = await (prisma as any).supportTicket.create({
      data: {
        ticketNumber,
        subject: subject || "Order Issue",
        message: formattedMessage,
        priority: subject?.toLowerCase().includes("urgent") || subject?.toLowerCase().includes("track") ? "HIGH" : "MEDIUM",
        status: "OPEN",
        customerEmail: actualEmail || null,
        customerPhone: actualPhone || null,
        ...(userId ? { userId } : {}),
      },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ticket created successfully",
      ticket: {
        ...newTicket,
        customerName: actualName,
        customerPhone: actualPhone,
        customerEmail: actualEmail,
        cleanMessage: message,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create ticket";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// 3. PATCH: Update Status
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, id, status } = body;
    const targetId = ticketId || id;

    if (!targetId || !status) {
      return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
    }

    const updated = await (prisma as any).supportTicket.update({
      where: { id: targetId },
      data: { status },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update status";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}