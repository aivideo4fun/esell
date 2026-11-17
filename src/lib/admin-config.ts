import { prisma } from "@/lib/prisma";
export async function readConfig<T>(key: string, defaults: T): Promise<T> {
  const entry = await prisma.activityLog.findFirst({ where: { action: `CONFIG:${key}` }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { details: true } });
  if (!entry?.details) return defaults;
  return { ...defaults, ...JSON.parse(entry.details) };
}
export async function writeConfig<T>(key: string, config: T) {
  await prisma.activityLog.create({ data: { action: `CONFIG:${key}`, details: JSON.stringify(config) } });
  return config;
}
export async function auditAdmin(action: string, details: Record<string, unknown>) {
  await prisma.activityLog.create({ data: { action, details: JSON.stringify(details) } });
}
