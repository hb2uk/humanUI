import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().cuid().optional(),
  email: z.string().email('Invalid email format'),
  name: z.string().nullable(),
  organizationId: z.string().nullable(),
  tenantId: z.string().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().cuid(),
});

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>; 