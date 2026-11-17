import { rateLimit } from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { issueSession, sessionCookieOptions, verifySession } from "@/lib/security/session";
function equal(a: unknown, b: string) {
  if (typeof a !== "string") return false;
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export async function POST(req: Request) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return NextResponse.json({ success: false, error: "Admin login is not configured" }, { status: 503 });
  try {
    const body = await req.json();
    if (!(await rateLimit("admin-login", String(body.identifier || body.email || body.mobile || "unknown"), 12))) return NextResponse.json({ success: false, error: "Too many attempts. Please wait 10 minutes." }, { status: 429 });
    if (!equal(body.email, email) || !equal(body.password, password)) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
    const token = await issueSession(email, "ADMIN");
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, { ...sessionCookieOptions, maxAge: 8 * 3600 });
    response.cookies.delete("admin_session");
    return response;
  } catch { return NextResponse.json({ success: false, error: "Unable to sign in" }, { status: 503 }); }
}
export async function GET() {
  const id = await verifySession((await cookies()).get("admin_token")?.value, "ADMIN");
  return NextResponse.json({ authenticated: !!id }, { status: id ? 200 : 401 });
}
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_token"); response.cookies.delete("admin_session");
  return response;
}
