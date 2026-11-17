import { NextResponse } from "next/server";
import { removeCategory } from "@/lib/admin-categories";
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await removeCategory((await params).id); return NextResponse.json({ success: true }); }
  catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unable to delete" }, { status: 409 }); }
}
