import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/security/session";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const adminApi = path.startsWith("/api/admin/");
  const publicAdminAuth = path === "/api/admin/auth";
  const legacyCustomerAuth = path === "/api/admin/auth/customer";
  const adminPage = path.startsWith("/admin") && path !== "/admin/login";
  const mutates = !["GET", "HEAD", "OPTIONS"].includes(req.method);
  if (path.startsWith("/api/") && mutates) {
    const origin = req.headers.get("origin");
    const configuredOrigin = process.env.NODE_ENV === "production" && process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : req.nextUrl.origin;
    if ((origin && origin !== configuredOrigin) || req.headers.get("sec-fetch-site") === "cross-site") {
      return NextResponse.json({ success: false, error: "Cross-site request rejected" }, { status: 403 });
    }
  }
  if ((adminApi && !publicAdminAuth && !legacyCustomerAuth) || adminPage || (path === "/api/footer" && mutates)) {
    const id = await verifySession(req.cookies.get("admin_token")?.value, "ADMIN");
    if (!id) return adminPage
      ? NextResponse.redirect(new URL("/admin/login", req.url))
      : NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  }
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  if (path.startsWith("/api/")) response.headers.set("Cache-Control", "no-store");
  return response;
}
export const config = { matcher: ["/api/:path*", "/admin/:path*"] };
