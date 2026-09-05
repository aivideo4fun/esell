import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";

    // Registered customers jinhone account banaya / login kiya
    const loggedInUsers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            wishlists: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const filtered = loggedInUsers.filter((u) => {
      return (
        (u.name && u.name.toLowerCase().includes(search)) ||
        (u.email && u.email.toLowerCase().includes(search)) ||
        (u.phone && u.phone.includes(search))
      );
    });

    return NextResponse.json(
      {
        success: true,
        totalLoggedInUsers: loggedInUsers.length,
        users: filtered,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load logins";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}