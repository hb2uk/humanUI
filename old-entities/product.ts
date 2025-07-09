import { z } from 'zod';

// Base product schema
export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive').min(0, 'Price cannot be negative'),
  categoryId: z.string().min(1, 'Category is required'),
  isPublished: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  tags: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  nutritionInfo: z.object({
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    carbs: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
  }).optional(),
  customizations: z.object({
    size: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      isAvailable: z.boolean(),
    })).default([]),
    temperature: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      isAvailable: z.boolean(),
    })).default([]),
    milkType: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      isAvailable: z.boolean(),
    })).default([]),
    sugarLevel: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      isAvailable: z.boolean(),
    })).default([]),
    extras: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      isAvailable: z.boolean(),
    })).default([]),
  }).optional(),
  organizationId: z.string().min(1, 'Organization is required'),
  storeId: z.string().min(1, 'Store is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create product schema (without id and timestamps)
export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update product schema (all fields optional except id)
export const updateProductSchema = productSchema.partial().extend({
  id: z.string().min(1, 'Product ID is required'),
});

// Product list query schema
export const productListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  isPublished: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  organizationId: z.string().optional(),
  storeId: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Product search schema
export const productSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  categoryId: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
  limit: z.number().min(1).max(50).default(10),
});

// Export types
export type Product = z.infer<typeof productSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type ProductSearch = z.infer<typeof productSearchSchema>; 