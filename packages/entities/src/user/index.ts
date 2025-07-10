import { z } from 'zod';
import { entityRegistry } from '../core/EntityRegistry';
import { TenantRules, BusinessLogic } from '../core/SchemaBuilder';

// User schema with proper nullable fields
export const userSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  username: z.string().min(3).max(50).nullable(),
  phone: z.string().nullable(),
  avatar: z.string().nullable(),
  role: z.enum(['admin', 'manager', 'user']).default('user'),
  organizationId: z.string().cuid().nullable(),
  storeId: z.string().cuid().nullable(),
  preferences: z.any().nullable(),
  metadata: z.any().nullable(),
  isActive: z.boolean().default(true),
  tenantId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

// Tenant rules for user
const userTenantRules: TenantRules = {
  requiredFields: ['email', 'firstName', 'lastName'],
  optionalFields: ['username', 'phone', 'avatar', 'role', 'organizationId', 'storeId', 'preferences', 'metadata'],
  uniqueConstraints: ['email', 'username'],
  validationRules: {
    email: { pattern: '^[^@]+@[^@]+\\.[^@]+$' },
    firstName: { minLength: 1, maxLength: 255 },
    lastName: { minLength: 1, maxLength: 255 },
    username: { pattern: '^[a-zA-Z0-9_-]+$' },
  },
};

// Business logic for user
const userBusinessLogic: BusinessLogic = {
  beforeCreate: async (data: any, tenantId?: string) => {
    // Generate username if not provided
    if (!data.username) {
      data.username = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}`;
    }
    
    // Set default preferences if not provided
    if (!data.preferences) {
      data.preferences = {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: false,
        },
      };
    }
    
    // Ensure email is lowercase
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
    
    return data;
  },
  
  beforeUpdate: async (id: string, data: any, tenantId?: string) => {
    // Ensure email is lowercase
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
    
    return data;
  },
  
  beforeDelete: async (id: string, tenantId?: string) => {
    // Check if user has active sessions or orders
    // This would be implemented in the service layer
    return true;
  },
};

// Register user entity
entityRegistry.registerEntity({
  name: 'user',
  schema: userSchema,
  tenantRules: userTenantRules,
  businessLogic: userBusinessLogic,
  displayName: 'Users',
  description: 'System users',
  icon: 'user',
  color: 'teal',
});

// Export the service generator
export const createUserService = () => {
  return entityRegistry.generateService('User');
};

// Export types
export type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUser = Partial<CreateUser> & { id: string }; 