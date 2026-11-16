import { NextResponse } from "next/server";
import { GET as list } from "../products/route";
import { PUT } from "../products/[id]/route";
export const GET = list;
export async function PATCH(req: Request) {
  const body = await req.json();
  if (typeof body.productId !== "string") return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
  return PUT(new Request(req.url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ price: body.price, stock: body.stock }) }), { params: Promise.resolve({ id: body.productId }) });
}
export async function POST() { return NextResponse.json({ success: false, error: "Use a category-specific price adjustment so changes can be reviewed" }, { status: 409 }); }
