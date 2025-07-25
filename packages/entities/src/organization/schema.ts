import { z } from 'zod';

// Base organization schema - updated to match Prisma types
export const organizationSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug must be less than 255 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').nullable(),
  logoUrl: z.string().url('Invalid logo URL').nullable(),
  website: z.string().url('Invalid website URL').nullable(),
  email: z.string().email('Invalid email format').nullable(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').nullable(),
  address: z.any().nullable(), // JsonValue in Prisma
  settings: z.any().default({}), // JsonValue in Prisma
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(false),
  tenantId: z.string().nullable(),
  createdBy: z.string().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create organization schema (without id and timestamps)
export const createOrganizationSchema = organizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update organization schema (all fields optional except id)
export const updateOrganizationSchema = createOrganizationSchema.partial().extend({
  id: z.string().cuid(),
});

// Organization query schema for filtering
export const organizationQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  tenantId: z.string().optional(),
  createdBy: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'slug', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Organization response schema
export const organizationResponseSchema = organizationSchema;

// Organizations list response schema
export const organizationsListResponseSchema = z.object({
  organizations: z.array(organizationResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Export types
export type Organization = z.infer<typeof organizationSchema>;
export type CreateOrganization = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;
export type OrganizationQuery = z.infer<typeof organizationQuerySchema>;
export type OrganizationResponse = z.infer<typeof organizationResponseSchema>;
export type OrganizationsListResponse = z.infer<typeof organizationsListResponseSchema>; 