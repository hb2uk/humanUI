import { z } from 'zod';
import { ItemStatus, Priority } from '@humanui/db';

// Base Item schema
export const itemSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.nativeEnum(ItemStatus).default(ItemStatus.DRAFT),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  tags: z.array(z.string().min(1)).default([]),
  metadata: z.record(z.any()).optional(),
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
  status: z.nativeEnum(ItemStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  tags: z.array(z.string()).optional(),
  tenantId: z.string().optional(),
  createdBy: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'status', 'priority', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
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
export type CreateItem = z.infer<typeof createItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;
export type ItemQuery = z.infer<typeof itemQuerySchema>;
export type ItemResponse = z.infer<typeof itemResponseSchema>;
export type ItemsListResponse = z.infer<typeof itemsListResponseSchema>; 