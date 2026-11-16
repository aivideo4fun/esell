import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { issueSession, readSession } from "./session";
function version(user: { id: string; password: string | null }) { return createHash("sha256").update(user.password || user.id).digest("hex"); }
export async function issueCustomerSession(user: { id: string; password: string | null }) { return issueSession(user.id, "CUSTOMER", version(user)); }
export async function getCustomerId() {
  const session = await readSession((await cookies()).get("customer_session")?.value, "CUSTOMER");
  if (!session?.sub) return null;
  const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { id: true, isActive: true, password: true } });
  return user?.isActive && session.version === version(user) ? user.id : null;
}
