import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  // If we've added new models (like ChatSession), the cached global instance needs a reset
  if (prisma && !(prisma as any).chatSession) {
    console.log(
      "Prisma: Model 'chatSession' missing from cached client. Re-instantiating...",
    );
    prisma = new PrismaClient();
  }
  globalForPrisma.prisma = prisma;
}

export { prisma };
