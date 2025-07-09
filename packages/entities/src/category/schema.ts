import { z } from 'zod';

// Base category schema
export const categorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long'),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  parentId: z.string().cuid().optional().nullable(),
  sortOrder: z.number().min(0).default(0),
  organizationId: z.string().cuid().min(1, 'Organization is required'),
  storeId: z.string().cuid().min(1, 'Store is required'),
  tenantId: z.string().optional(),
  createdBy: z.string().optional(),
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
export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().cuid(),
});

// Category query schema for filtering
export const categoryQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  parentId: z.string().cuid().optional(),
  organizationId: z.string().cuid().optional(),
  storeId: z.string().cuid().optional(),
  tenantId: z.string().optional(),
  createdBy: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'sortOrder', 'createdAt', 'updatedAt']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Category response schema
export const categoryResponseSchema = categorySchema;

// Categories list response schema
export const categoriesListResponseSchema = z.object({
  categories: z.array(categoryResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Category tree schema (for hierarchical display)
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
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
export type CategoriesListResponse = z.infer<typeof categoriesListResponseSchema>;
export type CategoryTree = z.infer<typeof categoryTreeSchema>; 