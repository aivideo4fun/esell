import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. GET: Fetch all promotional banners
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// 2. POST: Create new promotional banner
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, imageUrl, linkUrl, badgeText, displayOrder } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { success: false, error: "Banner Title and Image URL are required" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title: title.trim(),
        subtitle: subtitle || null,
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl || "/shop",
        badgeText: badgeText || "LIMITED TIME OFFER",
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create banner" },
      { status: 500 }
    );
  }
}

// 3. PATCH: Toggle Active status
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isActive } = body;

    const updated = await prisma.banner.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ success: true, banner: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update banner status" },
      { status: 500 }
    );
  }
}

// 4. DELETE: Delete Banner
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Banner ID is required" },
        { status: 400 }
      );
    }

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Banner deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete banner" },
      { status: 500 }
    );
  }
}