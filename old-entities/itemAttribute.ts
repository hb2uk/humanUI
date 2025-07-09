import { z } from 'zod';

export const itemAttributeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  attributeType: z.enum(['string', 'number', 'boolean', 'enum', 'json']),
  dataType: z.string(),
  isRequired: z.boolean().default(false),
  defaultValue: z.any().optional(),
  validationRules: z.record(z.any()).optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  organizationId: z.string().min(1, 'Organization is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createItemAttributeSchema = itemAttributeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateItemAttributeSchema = itemAttributeSchema.partial().extend({
  id: z.string().min(1, 'Attribute ID is required'),
});

export const itemAttributeListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  attributeType: z.enum(['string', 'number', 'boolean', 'enum', 'json']).optional(),
  organizationId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'sortOrder', 'createdAt']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Export types
export type ItemAttribute = z.infer<typeof itemAttributeSchema>;
export type CreateItemAttribute = z.infer<typeof createItemAttributeSchema>;
export type UpdateItemAttribute = z.infer<typeof updateItemAttributeSchema>;
export type ItemAttributeListQuery = z.infer<typeof itemAttributeListQuerySchema>; 