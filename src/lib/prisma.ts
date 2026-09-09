import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  let dbUrl = process.env.DATABASE_URL || "";

  if (dbUrl && !dbUrl.includes("connect_timeout")) {
    const separator = dbUrl.includes("?") ? "&" : "?";
    dbUrl = `${dbUrl}${separator}connect_timeout=15&pool_timeout=15`;
  }

  return new PrismaClient({
    datasourceUrl: dbUrl,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}