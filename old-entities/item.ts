import { z } from 'zod';

// Item variant schema
export const itemVariantSchema = z.object({
  id: z.string().optional(),
  itemId: z.string().min(1, 'Item ID is required'),
  variantCombination: z.record(z.any()).optional(),
  variantSku: z.string().optional(),
  priceAdjustment: z.number().default(0),
  stockQuantity: z.number().min(0).default(0),
  isAvailable: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Item schema (using camelCase for domain)
export const itemSchema = z.object({
  id: z.string().optional(),
  categoryType: z.string().min(1, 'Category type is required'),
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  hasVariants: z.boolean().default(false),
  variantGroups: z.record(z.any()).optional(),
  fulfillmentMethod: z.string().default('pickup'),
  fulfillmentConfig: z.record(z.any()).default({}),
  regulatoryFlags: z.record(z.any()).default({}),
  complianceRequired: z.boolean().default(false),
  basePrice: z.number().positive('Base price must be positive'),
  currency: z.string().default('THB'),
  pricingRules: z.record(z.any()).default({}),
  organizationId: z.string().min(1, 'Organization is required'),
  storeId: z.string().optional(),
  isActive: z.boolean().default(true),
  variants: z.array(itemVariantSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create item schema (without id and timestamps)
export const createItemSchema = itemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update item schema (all fields optional except id)
export const updateItemSchema = itemSchema.partial().extend({
  id: z.string().min(1, 'Item ID is required'),
});

// Item list query schema
export const itemListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryType: z.string().optional(),
  hasVariants: z.boolean().optional(),
  organizationId: z.string().optional(),
  storeId: z.string().optional(),
  sortBy: z.enum(['name', 'basePrice', 'createdAt', 'updatedAt']).default('createdAt'),
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

// Export types
export type Item = z.infer<typeof itemSchema>;
export type ItemVariant = z.infer<typeof itemVariantSchema>;
export type CreateItem = z.infer<typeof createItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;
export type ItemListQuery = z.infer<typeof itemListQuerySchema>;
export type ItemSearch = z.infer<typeof itemSearchSchema>; 