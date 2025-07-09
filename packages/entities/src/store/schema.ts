import { z } from 'zod';

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(255, 'Street must be less than 255 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  state: z.string().min(1, 'State is required').max(100, 'State must be less than 100 characters'),
  postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code must be less than 20 characters'),
  country: z.string().min(1, 'Country is required').max(100, 'Country must be less than 100 characters'),
});

// Operating hours schema
export const operatingHoursSchema = z.object({
  open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  isClosed: z.boolean().default(false),
});

// Base store schema
export const storeSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  displayName: z.string().max(255, 'Display name must be less than 255 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  address: addressSchema,
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  timezone: z.string().max(50, 'Timezone must be less than 50 characters').optional(),
  isActive: z.boolean().default(true),
  storeType: z.string().max(100, 'Store type must be less than 100 characters').optional(),
  operatingHours: z.record(z.string(), operatingHoursSchema).optional(),
  organizationId: z.string().cuid().min(1, 'Organization is required'),
  tenantId: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create store schema (without id and timestamps)
export const createStoreSchema = storeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update store schema (all fields optional except id)
export const updateStoreSchema = createStoreSchema.partial().extend({
  id: z.string().cuid(),
});

// Store query schema for filtering
export const storeQuerySchema = z.object({
  search: z.string().optional(),
  organizationId: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
  storeType: z.string().optional(),
  tenantId: z.string().optional(),
  createdBy: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'displayName', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Store response schema
export const storeResponseSchema = storeSchema;

// Stores list response schema
export const storesListResponseSchema = z.object({
  stores: z.array(storeResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Export types
export type Store = z.infer<typeof storeSchema>;
export type CreateStore = z.infer<typeof createStoreSchema>;
export type UpdateStore = z.infer<typeof updateStoreSchema>;
export type StoreQuery = z.infer<typeof storeQuerySchema>;
export type StoreResponse = z.infer<typeof storeResponseSchema>;
export type StoresListResponse = z.infer<typeof storesListResponseSchema>;
export type Address = z.infer<typeof addressSchema>;
export type OperatingHours = z.infer<typeof operatingHoursSchema>; 