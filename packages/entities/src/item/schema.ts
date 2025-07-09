import { z } from 'zod';
import { ItemStatus, Priority } from '@humanui/db';

// Item variant schema
export const itemVariantSchema = z.object({
  id: z.string().cuid().optional(),
  itemId: z.string().cuid().min(1, 'Item ID is required'),
  variantCombination: z.record(z.any()).optional(),
  variantSku: z.string().optional(),
  priceAdjustment: z.number().default(0),
  stockQuantity: z.number().min(0).default(0),
  isAvailable: z.boolean().default(true),
  tenantId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Base Item schema (enhanced version)
export const itemSchema = z.object({
  id: z.string().cuid().optional(),
  categoryType: z.string().min(1, 'Category type is required').max(100, 'Category type must be less than 100 characters'),
  sku: z.string().min(1, 'SKU is required').max(100, 'SKU must be less than 100 characters'),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  hasVariants: z.boolean().default(false),
  variantGroups: z.record(z.any()).optional(),
  fulfillmentMethod: z.string().default('pickup'),
  fulfillmentConfig: z.record(z.any()).default({}),
  regulatoryFlags: z.record(z.any()).default({}),
  complianceRequired: z.boolean().default(false),
  basePrice: z.number().positive('Base price must be positive'),
  currency: z.string().default('THB'),
  pricingRules: z.record(z.any()).default({}),
  status: z.nativeEnum(ItemStatus).default(ItemStatus.DRAFT),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  tags: z.array(z.string().min(1)).default([]),
  metadata: z.record(z.any()).optional(),
  organizationId: z.string().cuid().min(1, 'Organization is required'),
  storeId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  tenantId: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create Item schema (without id, timestamps)
export const createItemSchema = itemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update Item schema (all fields optional except id)
export const updateItemSchema = createItemSchema.partial().extend({
  id: z.string().cuid(),
});

// Item query schema for filtering
export const itemQuerySchema = z.object({
  search: z.string().optional(),
  categoryType: z.string().optional(),
  hasVariants: z.boolean().optional(),
  status: z.nativeEnum(ItemStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  tags: z.array(z.string()).optional(),
  organizationId: z.string().cuid().optional(),
  storeId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  tenantId: z.string().optional(),
  createdBy: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'basePrice', 'status', 'priority', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Item search schema
export const itemSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  categoryType: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  hasVariants: z.boolean().optional(),
  limit: z.number().min(1).max(50).default(10),
});

// Item response schema
export const itemResponseSchema = itemSchema;

// Items list response schema
export const itemsListResponseSchema = z.object({
  items: z.array(itemResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Export types
export type Item = z.infer<typeof itemSchema>;
export type ItemVariant = z.infer<typeof itemVariantSchema>;
export type CreateItem = z.infer<typeof createItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;
export type ItemQuery = z.infer<typeof itemQuerySchema>;
export type ItemSearch = z.infer<typeof itemSearchSchema>;
export type ItemResponse = z.infer<typeof itemResponseSchema>;
export type ItemsListResponse = z.infer<typeof itemsListResponseSchema>; 