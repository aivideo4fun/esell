import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";

  // Agar admin route nahi hai toh request aage bhej dein
  if (!isAdminApi && !isAdminPage) {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin_token")?.value;

  // Agar token nahi hai
  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ success: false, error: "Unauthorized - No Token Provided" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    // Check karein ki role ADMIN hai ya nahi
    if (payload.role !== "ADMIN") {
      throw new Error("Invalid Admin Role");
    }
  } catch (error) {
    if (isAdminApi) {
      return NextResponse.json({ success: false, error: "Unauthorized - Invalid or Expired Token" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};