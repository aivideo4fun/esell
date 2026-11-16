import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/security/customer";
const select = { id: true, name: true, email: true, phone: true, isEmailVerified: true };
export async function GET() {
  const id = await getCustomerId();
  if (!id) return NextResponse.json({ success: false, error: "Please sign in" }, { status: 401 });
  const customer = await prisma.user.findUnique({ where: { id }, select });
  return NextResponse.json({ success: true, customer });
}
export async function PUT(req: Request) {
  const id = await getCustomerId();
  if (!id) return NextResponse.json({ success: false, error: "Please sign in" }, { status: 401 });
  const body = await req.json();
  if (typeof body.name !== "string" || !body.name.trim() || body.name.length > 100) return NextResponse.json({ success: false, error: "Enter a valid name" }, { status: 400 });
  // Phone, email and verification flags require separate verified ownership flows.
  const customer = await prisma.user.update({ where: { id }, data: { name: body.name.trim() }, select });
  return NextResponse.json({ success: true, customer });
}
