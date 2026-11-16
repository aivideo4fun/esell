import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/security/customer";
export const dynamic = "force-dynamic";
const unauthorized = () => NextResponse.json({ success: false, error: "Please sign in" }, { status: 401 });
export async function GET() {
  const userId = await getCustomerId(); if (!userId) return unauthorized();
  const addresses = await prisma.address.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ success: true, addresses });
}
export async function POST(req: Request) {
  const userId = await getCustomerId(); if (!userId) return unauthorized();
  const body = await req.json();
  if (!["fullName", "phone", "street", "city", "state", "pincode"].every((key) => typeof body[key] === "string" && body[key].trim() && body[key].length <= 300) || !/^\d{6}$/.test(body.pincode)) return NextResponse.json({ success: false, error: "Enter a complete address" }, { status: 400 });
  const address = await prisma.address.create({ data: { userId, fullName: body.fullName.trim(), phone: body.phone.trim(), street: body.street.trim(), city: body.city.trim(), state: body.state.trim(), pincode: body.pincode } });
  return NextResponse.json({ success: true, address });
}
export async function DELETE(req: Request) {
  const userId = await getCustomerId(); if (!userId) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  const address = id ? await prisma.address.findFirst({ where: { id, userId } }) : null;
  if (!address) return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
  // Detach from the saved-address list; preserve the shipping snapshot of any order.
  await prisma.address.updateMany({ where: { id: address.id, userId }, data: { userId: null } });
  return NextResponse.json({ success: true });
}
