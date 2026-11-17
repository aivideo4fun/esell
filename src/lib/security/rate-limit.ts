import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
// Database-backed attempt buckets work across app workers. Counts are approximate under simultaneous requests.
export async function rateLimit(scope: string, identifier: string, limit = 12) {
  const key = `rate:${createHash("sha256").update(`${scope}:${identifier.toLowerCase().slice(0, 200)}`).digest("hex")}`;
  const now = new Date();
  const count = await prisma.verificationOtp.count({ where: { identifier: key, expiresAt: { gt: now } } });
  if (count >= limit) return false;
  await prisma.verificationOtp.create({ data: { identifier: key, otp: "", expiresAt: new Date(Date.now() + 10 * 60000) } });
  await prisma.verificationOtp.deleteMany({ where: { expiresAt: { lt: now } } });
  return true;
}
