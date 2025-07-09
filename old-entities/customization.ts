import { z } from 'zod';

// Customization category schema
export const customizationCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  organizationId: z.string().min(1, 'Organization is required'),
  storeId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Customization schema
export const customizationSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  category: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  priceAdjustment: z.number().default(0),
  maxQuantity: z.number().min(1).default(1),
  sortOrder: z.number().min(0).default(0),
  isAvailable: z.boolean().default(true),
  organizationId: z.string().min(1, 'Organization is required'),
  storeId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create customization category schema
export const createCustomizationCategorySchema = customizationCategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update customization category schema
export const updateCustomizationCategorySchema = customizationCategorySchema.partial().extend({
  id: z.string().min(1, 'Category ID is required'),
});

// Create customization schema
export const createCustomizationSchema = customizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update customization schema
export const updateCustomizationSchema = customizationSchema.partial().extend({
  id: z.string().min(1, 'Customization ID is required'),
});

// Customization list query schema
export const customizationListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  categoryId: z.string().optional(),
  isAvailable: z.boolean().optional(),
  organizationId: z.string().optional(),
  storeId: z.string().optional(),
  sortBy: z.enum(['name', 'sortOrder', 'createdAt']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Export types
export type CustomizationCategory = z.infer<typeof customizationCategorySchema>;
export type Customization = z.infer<typeof customizationSchema>;
export type CreateCustomizationCategory = z.infer<typeof createCustomizationCategorySchema>;
export type UpdateCustomizationCategory = z.infer<typeof updateCustomizationCategorySchema>;
export type CreateCustomization = z.infer<typeof createCustomizationSchema>;
export type UpdateCustomization = z.infer<typeof updateCustomizationSchema>;
export type CustomizationListQuery = z.infer<typeof customizationListQuerySchema>; 