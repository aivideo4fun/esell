import { rateLimit } from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { issueSession, sessionCookieOptions } from "@/lib/security/session";
import { verifyPhoneProof } from "@/lib/security/firebase";
import { getCustomerId, issueCustomerSession } from "@/lib/security/customer";

export async function GET() {
  const id = await getCustomerId();
  const user = id ? await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, phone: true } }) : null;
  return NextResponse.json({ success: !!user, authenticated: !!user, user }, { status: user ? 200 : 401 });
}
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("customer_session"); response.cookies.delete("customer_id");
  return response;
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!(await rateLimit("customer-auth", String(body.identifier || body.email || body.mobile || "unknown"), 12))) return NextResponse.json({ success: false, error: "Too many attempts. Please wait 10 minutes." }, { status: 429 });
    const { action, identifier, password, name, email, mobile, newPassword, idToken } = body;
    if (action === "LOGIN") {
      if (typeof identifier !== "string" || typeof password !== "string" || password.length > 200) return NextResponse.json({ success: false, error: "Enter valid credentials" }, { status: 400 });
      const input = identifier.trim().toLowerCase();
      const phone = input.replace(/\D/g, "").slice(-10);
      const user = await prisma.user.findFirst({ where: { OR: [{ email: input }, ...(/^\d{10}$/.test(phone) ? [{ phone }] : [])] } });
      if (!user?.isActive || !user.password || !(await bcrypt.compare(password, user.password))) return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
      const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
      response.cookies.set("customer_session", await issueCustomerSession(user), { ...sessionCookieOptions, maxAge: 7 * 86400 });
      response.cookies.delete("customer_id");
      return response;
    }
    if (action === "CHECK_FORGOT_USER") return NextResponse.json({ success: true, message: "Verify your phone to continue" });
    if (!["REGISTER_VERIFIED", "RESET_PASSWORD_VERIFIED", "OTP_LOGIN"].includes(action)) return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    const phone = typeof mobile === "string" ? mobile.replace(/\D/g, "").slice(-10) : "";
    if (!/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ success: false, error: "Valid mobile number required" }, { status: 400 });
    try { await verifyPhoneProof(idToken, phone); }
    catch { return NextResponse.json({ success: false, error: "Complete SMS verification again" }, { status: 403 }); }
    if (action !== "OTP_LOGIN") {
      const value = action === "REGISTER_VERIFIED" ? password : newPassword;
      if (typeof value !== "string" || value.length < 8 || value.length > 128) return NextResponse.json({ success: false, error: "Use a password of 8–128 characters" }, { status: 400 });
      if (action === "RESET_PASSWORD_VERIFIED") {
        await prisma.user.updateMany({ where: { phone, isActive: true }, data: { password: await bcrypt.hash(value, 12) } });
        return NextResponse.json({ success: true, message: "Password updated. Please sign in." });
      }
    }
    let user = await prisma.user.findUnique({ where: { phone } });
    if (action === "REGISTER_VERIFIED" && user) return NextResponse.json({ success: false, error: "Account already exists. Please sign in." }, { status: 409 });
    if (!user) {
      const customerEmail = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.trim().toLowerCase() : `user_${phone}@catchbuddy.local`;
      user = await prisma.user.create({ data: { name: typeof name === "string" ? name.trim().slice(0, 100) : "Customer", phone, email: customerEmail, password: action === "REGISTER_VERIFIED" ? await bcrypt.hash(password, 12) : null } });
    }
    if (!user.isActive) return NextResponse.json({ success: false, error: "Account unavailable" }, { status: 403 });
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
    response.cookies.set("customer_session", await issueCustomerSession(user), { ...sessionCookieOptions, maxAge: 7 * 86400 });
    return response;
  } catch { return NextResponse.json({ success: false, error: "Unable to complete request" }, { status: 400 }); }
}
