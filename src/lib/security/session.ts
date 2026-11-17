import { SignJWT, jwtVerify } from "jose";

export function sessionKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("Configure JWT_SECRET with at least 32 random characters");
  return new TextEncoder().encode(secret);
}
export async function issueSession(id: string, role: "ADMIN" | "CUSTOMER", version?: string) {
  return new SignJWT({ role, ...(version ? { version } : {}) }).setProtectedHeader({ alg: "HS256" }).setSubject(id)
    .setIssuer("catchbuddy").setAudience("catchbuddy-web").setIssuedAt()
    .setExpirationTime(role === "ADMIN" ? "8h" : "7d").sign(sessionKey());
}
export async function readSession(token: string | undefined, role: "ADMIN" | "CUSTOMER") {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), {
      algorithms: ["HS256"], issuer: "catchbuddy", audience: "catchbuddy-web",
    });
    return payload.role === role && typeof payload.sub === "string" ? payload : null;
  } catch { return null; }
}
export const sessionCookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/",
};

export async function verifySession(token: string | undefined, role: "ADMIN" | "CUSTOMER") {
  return (await readSession(token, role))?.sub || null;
}
