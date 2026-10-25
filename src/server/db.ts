import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '@/lib/env';

/**
 * One PrismaClient per process. Next's dev server re-evaluates modules on every
 * edit, so the instance is cached on `globalThis` to avoid exhausting the
 * connection pool across hot reloads.
 */
const createPrismaClient = (): PrismaClient =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    log: env.isProduction ? ['error'] : ['error', 'warn'],
  });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}
