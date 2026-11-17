import { NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/admin-config";
import { faqDefaults } from "@/lib/faq-defaults";
import { textField } from "@/lib/admin-validation";
export async function GET() { return NextResponse.json({ success: true, config: await readConfig("FAQ", faqDefaults) }); }
export async function POST(req: Request) {
  try { const b = await req.json(); if (!Array.isArray(b.items) || b.items.length > 50) throw new Error("Use at most 50 questions");
    const items = b.items.map((item: any, index: number) => ({ id: String(index), question: textField(item.question, "question", 300), answer: textField(item.answer, "answer", 3000) }));
    await writeConfig("FAQ", { items }); return NextResponse.json({ success: true, config: { items } });
  } catch (e) { return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Save failed" }, { status: 400 }); }
}
