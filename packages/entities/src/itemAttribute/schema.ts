import { z } from 'zod';

// Base itemAttribute schema
export const itemAttributeSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  displayName: z.string().min(1, 'Display name is required').max(255, 'Display name must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  attributeType: z.enum(['string', 'number', 'boolean', 'enum', 'json']),
  dataType: z.string().max(100, 'Data type must be less than 100 characters'),
  isRequired: z.boolean().default(false),
  defaultValue: z.any().optional(),
  validationRules: z.record(z.any()).optional(),
  sortOrder: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  organizationId: z.string().cuid().min(1, 'Organization is required'),
  tenantId: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create itemAttribute schema (without id and timestamps)
export const createItemAttributeSchema = itemAttributeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update itemAttribute schema (all fields optional except id)
export const updateItemAttributeSchema = createItemAttributeSchema.partial().extend({
  id: z.string().cuid(),
});

// ItemAttribute query schema for filtering
export const itemAttributeQuerySchema = z.object({
  search: z.string().optional(),
  attributeType: z.enum(['string', 'number', 'boolean', 'enum', 'json']).optional(),
  organizationId: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  tenantId: z.string().optional(),
  createdBy: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'displayName', 'sortOrder', 'createdAt', 'updatedAt']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ItemAttribute response schema
export const itemAttributeResponseSchema = itemAttributeSchema;

// ItemAttributes list response schema
export const itemAttributesListResponseSchema = z.object({
  itemAttributes: z.array(itemAttributeResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Export types
export type ItemAttribute = z.infer<typeof itemAttributeSchema>;
export type CreateItemAttribute = z.infer<typeof createItemAttributeSchema>;
export type UpdateItemAttribute = z.infer<typeof updateItemAttributeSchema>;
export type ItemAttributeQuery = z.infer<typeof itemAttributeQuerySchema>;
export type ItemAttributeResponse = z.infer<typeof itemAttributeResponseSchema>;
export type ItemAttributesListResponse = z.infer<typeof itemAttributesListResponseSchema>; 