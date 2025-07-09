import { z } from 'zod';

export const organizationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  settings: z.record(z.any()).default({}),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createOrganizationSchema = organizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOrganizationSchema = organizationSchema.partial().extend({
  id: z.string().min(1, 'Organization ID is required'),
});

export const organizationListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export types
export type Organization = z.infer<typeof organizationSchema>;
export type CreateOrganization = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;
export type OrganizationListQuery = z.infer<typeof organizationListQuerySchema>; 