export * from '@prisma/client';

import { PrismaClient, ItemStatus, Priority } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Re-export enums for use in other packages
export { ItemStatus, Priority };
export * from './tenant'; 