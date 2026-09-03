import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Saare blog posts fetch karein
export async function GET() {
  try {
    const posts = await (prisma as any).blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, posts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load articles";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. POST: Naya article publish karein
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, author, content } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Article headline is required" },
        { status: 400 }
      );
    }

    // Slug generate karein
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const post = await (prisma as any).blogPost.create({
      data: {
        title: title.trim(),
        slug,
        category: category || "Tech & Accessories",
        author: author || "Admin Team",
        content: content || "",
        status: "PUBLISHED",
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to publish article";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 3. DELETE: Article delete karein
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Article ID required" }, { status: 400 });
    }

    await (prisma as any).blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Article deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete article";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}