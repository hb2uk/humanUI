import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Prisma middleware to enforce tenant isolation.
 * Usage: prisma.$use(tenantMiddleware(tenantId))
 */
export function tenantMiddleware(tenantId: string) {
  return async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
    // Only apply to models with tenantId
    const modelsWithTenant = ['Item', 'User'];
    if (modelsWithTenant.includes(params.model ?? '')) {
      if (['findMany', 'findFirst', 'findUnique', 'update', 'delete', 'count', 'aggregate', 'groupBy'].includes(params.action)) {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        params.args.where.tenantId = tenantId;
      } else if (['create', 'updateMany', 'createMany'].includes(params.action)) {
        if (!params.args) params.args = {};
        if (!params.args.data) params.args.data = {};
        params.args.data.tenantId = tenantId;
      }
    }
    return next(params);
  };
}

/**
 * PrismaClient extension to provide a tenant-scoped client
 * Usage: const tenantPrisma = prisma.forTenant(tenantId)
 */
export function extendWithTenant(prisma: PrismaClient) {
  return Object.assign(prisma, {
    forTenant(tenantId: string) {
      const client = prisma.$extends({});
      client.$use(tenantMiddleware(tenantId));
      return client;
    },
  });
} 