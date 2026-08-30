import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST: Handle Admin Login
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const validEmail = process.env.ADMIN_EMAIL || "admin@catchbuddy.com";
    const validPassword = process.env.ADMIN_PASSWORD || "AdminSecurePass@2026";

    if (email === validEmail && password === validPassword) {
      const cookieStore = await cookies();
      
      // 7-day secure admin auth session cookie
      cookieStore.set("admin_session", "authenticated_admin_token_2026", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({ success: true, message: "Logged in successfully" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid admin email or password" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Handle Admin Logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}

// GET: Check Auth Status
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (session && session.value === "authenticated_admin_token_2026") {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}