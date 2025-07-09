import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email('Valid email is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user', 'manager']).default('user'),
  organizationId: z.string().min(1, 'Organization is required'),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = userSchema.partial().extend({
  id: z.string().min(1, 'User ID is required'),
});

export const userListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['admin', 'user', 'manager']).optional(),
  organizationId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export types
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>; 