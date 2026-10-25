import type { AdminUser } from '@prisma/client';
import { prisma } from '../db';

export const findByEmail = (email: string): Promise<AdminUser | null> =>
  prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });

export const findById = (id: string): Promise<AdminUser | null> =>
  prisma.adminUser.findUnique({ where: { id } });
