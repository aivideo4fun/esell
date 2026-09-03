import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Fetch all pages (agar database khali hai toh default pages seed kar dega)
export async function GET() {
  try {
    let pages = await (prisma as any).staticPage.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Default Seed agar koi page na ho
    if (pages.length === 0) {
      const defaultPages = [
        {
          title: "About Us",
          slug: "about",
          content: "Welcome to CatchBuddy! We bring you the most trending and innovative smart gadgets direct to your doorstep with guaranteed verified quality.",
          status: "ACTIVE",
        },
        {
          title: "Terms & Conditions",
          slug: "terms",
          content: "By placing an order on CatchBuddy, you agree to our verified dispatch and payment security terms. All prepaid UPI payments receive special instant discounts.",
          status: "ACTIVE",
        },
        {
          title: "Privacy Policy",
          slug: "privacy",
          content: "Your privacy is our priority. CatchBuddy uses 256-bit SSL encrypted checkouts and does not share your phone number or shipping details with unauthorized third parties.",
          status: "ACTIVE",
        },
        {
          title: "Shipping & Return Policy",
          slug: "shipping-policy",
          content: "We provide Free Express Delivery across India within 24-48 hours of order confirmation. Returns and replacements are covered by our 5-Day Hassle-Free Replacement Policy.",
          status: "ACTIVE",
        },
      ];

      for (const p of defaultPages) {
        await (prisma as any).staticPage.create({ data: p });
      }

      pages = await (prisma as any).staticPage.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({ success: true, pages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load pages";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 2. POST: Create or Update Page
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, slug, content, status } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, error: "Title and slug are required" }, { status: 400 });
    }

    const cleanSlug = slug.replace(/^\/+/, "").trim().toLowerCase();

    if (id) {
      // UPDATE
      const updated = await (prisma as any).staticPage.update({
        where: { id },
        data: {
          title: title.trim(),
          slug: cleanSlug,
          content: content || "",
          status: status || "ACTIVE",
        },
      });
      return NextResponse.json({ success: true, page: updated });
    }

    // CREATE NEW
    const created = await (prisma as any).staticPage.create({
      data: {
        title: title.trim(),
        slug: cleanSlug,
        content: content || "",
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, page: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save page";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 3. DELETE: Delete Page
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Page ID required" }, { status: 400 });
    }

    await (prisma as any).staticPage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Page deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete page";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}