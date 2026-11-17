import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { csvCell } from "@/lib/admin-validation";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const kind = new URL(req.url).searchParams.get("kind"); let rows: Record<string, unknown>[];
  switch (kind) {
    case "orders": rows = await prisma.order.findMany({ select: { id: true, orderNumber: true, totalAmount: true, discountAmount: true, couponCode: true, orderStatus: true, paymentStatus: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 10000 }); break;
    case "products": rows = await prisma.product.findMany({ select: { id: true, title: true, sku: true, price: true, stock: true, isActive: true }, take: 10000 }); break;
    case "customers": rows = await prisma.user.findMany({ where: { role: "CUSTOMER" }, select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true }, take: 10000 }); break;
    case "payments": rows = await prisma.payment.findMany({ select: { id: true, orderId: true, gateway: true, gatewayTxnId: true, amount: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 10000 }); break;
    default: return NextResponse.json({ success: false, error: "Choose orders, products, customers or payments" }, { status: 400 });
  }
  const keys = rows.length ? Object.keys(rows[0]) : ["No records"];
  const csv = '\uFEFF' + [keys.map(csvCell).join(","), ...rows.map((row) => keys.map((key) => csvCell(row[key] instanceof Date ? (row[key] as Date).toISOString() : row[key])).join(","))].join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="catchbuddy-${kind}.csv"`, "Cache-Control": "no-store" } });
}
