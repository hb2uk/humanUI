import { z } from 'zod';

// Base category schema
export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long'),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().min(0).default(0),
  organizationId: z.string().min(1, 'Organization is required'),
  storeId: z.string().min(1, 'Store is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create category schema (without id and timestamps)
export const createCategorySchema = categorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update category schema (all fields optional except id)
export const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().min(1, 'Category ID is required'),
});

// Category list query schema
export const categoryListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  parentId: z.string().optional(),
  organizationId: z.string().optional(),
  storeId: z.string().optional(),
  sortBy: z.enum(['name', 'sortOrder', 'createdAt', 'updatedAt']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Category tree schema (for hierarchical display) - properly typed for recursion
export const categoryTreeSchema: z.ZodType<any> = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean(),
  isPublished: z.boolean(),
  sortOrder: z.number(),
  children: z.array(z.lazy(() => categoryTreeSchema)).default([]),
  productCount: z.number().default(0),
});

// Export types
export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;
export type CategoryTree = z.infer<typeof categoryTreeSchema>; 