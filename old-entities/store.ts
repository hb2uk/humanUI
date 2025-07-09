import { z } from 'zod';

export const storeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().optional(),
  description: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().default(true),
  storeType: z.string().optional(),
  operatingHours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    isClosed: z.boolean(),
  })).optional(),
  organizationId: z.string().min(1, 'Organization is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createStoreSchema = storeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateStoreSchema = storeSchema.partial().extend({
  id: z.string().min(1, 'Store ID is required'),
});

export const storeListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  organizationId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export types
export type Store = z.infer<typeof storeSchema>;
export type CreateStore = z.infer<typeof createStoreSchema>;
export type UpdateStore = z.infer<typeof updateStoreSchema>;
export type StoreListQuery = z.infer<typeof storeListQuerySchema>; 